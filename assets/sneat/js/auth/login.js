document.addEventListener('DOMContentLoaded', function () {
    // --- Form Elements ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');

    // --- Feedback Elements ---
    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');

    // --- Validation Functions ---
    const validations = {
        email: (value) => /^\S+@\S+\.\S+$/.test(value) ? { valid: true } : { valid: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        password: (value) => value.trim() !== '' ? { valid: true } : { valid: false, message: 'กรุณากรอกรหัสผ่าน' },
    };

    function validateField(input, feedback, validator) {
        const value = input.value;
        const result = validator(value);
        const parentGroup = input.closest('.input-group');

        if (value.trim() === '') {
            input.classList.remove('is-valid', 'is-invalid');
            if (parentGroup) parentGroup.classList.remove('is-valid', 'is-invalid');
            feedback.textContent = '';
        } else if (result.valid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (parentGroup) {
                parentGroup.classList.remove('is-invalid');
                parentGroup.classList.add('is-valid');
            }
            feedback.textContent = '';
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            if (parentGroup) {
                parentGroup.classList.remove('is-valid');
                parentGroup.classList.add('is-invalid');
            }
            feedback.textContent = result.message;
        }
        checkAllValidations();
    }

    function checkAllValidations() {
        const isEmailValid = validations.email(emailInput.value).valid;
        const isPasswordValid = validations.password(passwordInput.value).valid;
        loginButton.disabled = !(isEmailValid && isPasswordValid);
    }

    // --- Event Listeners ---
    emailInput.addEventListener('input', () => validateField(emailInput, emailFeedback, validations.email));
    passwordInput.addEventListener('input', () => validateField(passwordInput, passwordFeedback, validations.password));

    // Password Toggle with Font Awesome
    const passwordToggles = document.querySelectorAll('.form-password-toggle .input-group-text');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

});
