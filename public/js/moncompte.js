document.addEventListener('DOMContentLoaded', () => {
    const accountForm = document.getElementById('accountForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const formTitle = document.getElementById('formTitle');
    const toggleFormLink = document.getElementById('toggleForm');
    const emailGroup = document.getElementById('emailGroup');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    
    let isLoginForm = true;

    if (toggleFormLink) {
        toggleFormLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginForm = !isLoginForm;

            if (isLoginForm) {
                formTitle.textContent = 'Connexion';
                submitBtn.textContent = 'Se connecter';
                emailGroup.style.display = 'none';
                confirmPasswordGroup.style.display = 'none';
                toggleFormLink.textContent = 'Créer un compte';
                accountForm.setAttribute('action', '/auth/login');
            } else {
                formTitle.textContent = 'Créer un compte';
                submitBtn.textContent = 'S\'inscrire';
                emailGroup.style.display = 'block';
                confirmPasswordGroup.style.display = 'block';
                toggleFormLink.textContent = 'J\'ai déjà un compte';
                accountForm.setAttribute('action', '/auth/register');
            }
        });
    }

    if (accountForm) {
        accountForm.addEventListener('submit', (e) => {
            if (!usernameInput.value || !passwordInput.value) {
                e.preventDefault();
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            if (!isLoginForm) {
                if (!emailInput.value) {
                    e.preventDefault();
                    alert('Veuillez saisir votre email.');
                    return;
                }

                if (passwordInput.value !== confirmPasswordInput.value) {
                    e.preventDefault();
                    alert('Les mots de passe ne correspondent pas.');
                    return;
                }

                if (passwordInput.value.length < 6) {
                    e.preventDefault();
                    alert('Le mot de passe doit contenir au moins 6 caractères.');
                    return;
                }
            }
        });
    }
});

async function submitPasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('Les nouveaux mots de passe ne correspondent pas.');
        return;
    }

    if (newPassword.length < 6) {
        alert('Le nouveau mot de passe doit contenir au moins 6 caractères.');
        return;
    }

    try {
        const response = await fetch('/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Mot de passe modifié avec succès !');
            document.getElementById('passwordChangeForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
        } else {
            alert(data.error || 'Une erreur est survenue.');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la modification du mot de passe.');
    }
}