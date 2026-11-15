document.addEventListener('DOMContentLoaded', function () {
    // --- Form Elements ---
    const form = document.getElementById('formAuthentication');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const idCardInput = document.getElementById('id_card');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const passwordInput = document.getElementById('password');
    const passwordConfirmationInput = document.getElementById('password_confirmation');
    const termsCheckbox = document.getElementById('terms-conditions');
    const registerButton = document.getElementById('registerButton');

    // Customer Type & Corporate Elements
    const customerTypeRadios = document.querySelectorAll('input[name="customer_type"]');
    const corporateFields = document.getElementById('corporateFields');
    const individualIdWrapper = document.getElementById('individualIdWrapper');
    const nameLabelText = document.getElementById('nameLabelText');
    const companyNameLabel = document.getElementById('companyNameLabel');
    const companyNameInput = document.getElementById('company_name');
    const taxIdInput = document.getElementById('tax_id');
    const branchTypeRadios = document.querySelectorAll('input[name="branch_type"]');
    const branchCodeWrapper = document.getElementById('branchCodeWrapper');
    const branchCodeInput = document.getElementById('branch_code');

    // --- Feedback Elements ---
    const nameFeedback = document.getElementById('nameFeedback');
    const emailFeedback = document.getElementById('emailFeedback');
    const idCardFeedback = document.getElementById('idCardFeedback');
    const idCardValidFeedback = document.getElementById('idCardValidFeedback');
    const companyNameFeedback = document.getElementById('companyNameFeedback');
    const taxIdFeedback = document.getElementById('taxIdFeedback');
    const taxIdValidFeedback = document.getElementById('taxIdValidFeedback');
    const phoneFeedback = document.getElementById('phoneFeedback');
    const addressFeedback = document.getElementById('addressFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');
    const passwordConfirmationFeedback = document.getElementById('passwordConfirmationFeedback');

    function getSelectedCustomerType() {
        const checked = document.querySelector('input[name="customer_type"]:checked');
        return checked ? checked.value : 'individual';
    }

    function getSelectedBranchType() {
        const checked = document.querySelector('input[name="branch_type"]:checked');
        return checked ? checked.value : 'head_office';
    }

    // --- Thai 13-digit Modulo 11 Validator ---
    function validateThai13Digits(value, fieldLabel) {
        const raw = (value || '').replace(/\D/g, '');
        if (!raw) {
            return { valid: false, message: `กรุณากรอก${fieldLabel}` };
        }
        if (raw.length !== 13) {
            return { valid: false, message: `กรุณากรอก${fieldLabel}ให้ครบ 13 หลัก (ปัจจุบัน ${raw.length}/13)` };
        }
        // Reject repeated single digits (e.g. 0000000000000, 1111111111111)
        if (/^(\d)\1{12}$/.test(raw)) {
            return { valid: false, message: `${fieldLabel}ไม่ถูกต้องตามหลักการคำนวณ` };
        }
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(raw.charAt(i), 10) * (13 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        if (parseInt(raw.charAt(12), 10) !== checkDigit) {
            return { valid: false, message: `${fieldLabel}ไม่ถูกต้อง (รหัสตรวจสอบไม่ตรง)` };
        }
        return { valid: true, message: `${fieldLabel}ถูกต้องสมบูรณ์` };
    }

    // --- Format 13-digit Thai ID / Tax ID with Hyphens (X-XXXX-XXXXX-XX-X) ---
    function format13Digits(rawDigits) {
        let formatted = '';
        if (rawDigits.length > 0) formatted += rawDigits.substring(0, 1);
        if (rawDigits.length > 1) formatted += '-' + rawDigits.substring(1, 5);
        if (rawDigits.length > 5) formatted += '-' + rawDigits.substring(5, 10);
        if (rawDigits.length > 10) formatted += '-' + rawDigits.substring(10, 12);
        if (rawDigits.length > 12) formatted += '-' + rawDigits.substring(12, 13);
        return formatted;
    }

    // --- Validation Rules ---
    const validations = {
        name: (val) => val.trim().length >= 2 ? { valid: true } : { valid: false, message: 'กรุณากรอกชื่อ-นามสกุลให้ถูกต้อง' },
        email: (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim()) ? { valid: true } : { valid: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        phone: (val) => /^0\d{9}$/.test(val.replace(/\D/g, '')) ? { valid: true } : { valid: false, message: 'กรุณากรอกเบอร์โทร 10 หลัก (ขึ้นต้นด้วย 0)' },
        address: (val) => val.trim().length >= 5 ? { valid: true } : { valid: false, message: 'กรุณากรอกที่อยู่ให้ชัดเจน' },
        password: (val) => val.length >= 8 ? { valid: true } : { valid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
        password_confirmation: (val) => (val === passwordInput.value && val.length > 0) ? { valid: true } : { valid: false, message: 'รหัสผ่านยืนยันไม่ตรงกัน' },
        id_card: (val) => validateThai13Digits(val, 'เลขบัตรประชาชน'),
        company_name: (val) => val.trim().length >= 2 ? { valid: true } : { valid: false, message: 'กรุณาระบุชื่อนิติบุคคล/หน่วยงาน' },
        tax_id: (val) => validateThai13Digits(val, 'เลขประจำตัวผู้เสียภาษี'),
        branch_code: (val) => {
            if (getSelectedBranchType() !== 'branch') return { valid: true };
            const clean = val.trim();
            return (clean.length === 5 && /^\d{5}$/.test(clean)) ? { valid: true } : { valid: false, message: 'รหัสสาขาต้องเป็นตัวเลข 5 หลัก (เช่น 00001)' };
        }
    };

    function validateField(input, feedback, validator, validFeedback = null) {
        if (!input) return;
        const value = input.value;
        const result = validator(value);
        const parentGroup = input.closest('.input-group');

        if (value.trim() === '') {
            input.classList.remove('is-valid', 'is-invalid');
            if (parentGroup) parentGroup.classList.remove('is-valid', 'is-invalid');
            if (feedback) feedback.textContent = '';
            if (validFeedback) validFeedback.style.display = 'none';
        } else if (result.valid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (parentGroup) {
                parentGroup.classList.remove('is-invalid');
                parentGroup.classList.add('is-valid');
            }
            if (feedback) feedback.textContent = '';
            if (validFeedback) {
                validFeedback.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i>${result.message || 'ข้อมูลถูกต้อง'}`;
                validFeedback.style.display = 'block';
            }
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            if (parentGroup) {
                parentGroup.classList.remove('is-valid');
                parentGroup.classList.add('is-invalid');
            }
            if (feedback) feedback.textContent = result.message;
            if (validFeedback) validFeedback.style.display = 'none';
        }
        checkAllValidations();
    }

    function checkAllValidations() {
        const type = getSelectedCustomerType();
        let valid = true;

        // Base fields
        if (!nameInput || !validations.name(nameInput.value).valid) valid = false;
        if (!emailInput || !validations.email(emailInput.value).valid) valid = false;
        if (!phoneInput || !validations.phone(phoneInput.value).valid) valid = false;
        if (!addressInput || !validations.address(addressInput.value).valid) valid = false;
        if (!passwordInput || !validations.password(passwordInput.value).valid) valid = false;
        if (!passwordConfirmationInput || !validations.password_confirmation(passwordConfirmationInput.value).valid) valid = false;

        // Type specific fields
        if (type === 'individual') {
            if (!idCardInput || !validations.id_card(idCardInput.value).valid) valid = false;
        } else {
            if (!companyNameInput || !validations.company_name(companyNameInput.value).valid) valid = false;
            if (!taxIdInput || !validations.tax_id(taxIdInput.value).valid) valid = false;
            if (getSelectedBranchType() === 'branch') {
                if (!branchCodeInput || !validations.branch_code(branchCodeInput.value).valid) valid = false;
            }
        }

        const termsOk = termsCheckbox ? termsCheckbox.checked : true;
        if (registerButton) {
            registerButton.disabled = !(valid && termsOk);
        }
    }

    // --- Switch Customer Type UI ---
    function updateCustomerTypeUI() {
        const type = getSelectedCustomerType();
        if (type === 'individual') {
            if (corporateFields) corporateFields.style.display = 'none';
            if (individualIdWrapper) individualIdWrapper.style.display = '';
            if (nameLabelText) nameLabelText.textContent = 'ชื่อ-นามสกุล';
            if (nameInput) nameInput.placeholder = 'สมชาย ใจดี';
        } else if (type === 'company') {
            if (corporateFields) corporateFields.style.display = '';
            if (individualIdWrapper) individualIdWrapper.style.display = 'none';
            if (nameLabelText) nameLabelText.textContent = 'ชื่อผู้ติดต่อ / ผู้มีอำนาจลงนาม';
            if (nameInput) nameInput.placeholder = 'สมชาย ใจดี (กรรมการผู้จัดการ)';
            if (companyNameLabel) companyNameLabel.textContent = 'ชื่อบริษัท / ห้างหุ้นส่วนจำกัด';
            if (companyNameInput) companyNameInput.placeholder = 'บริษัท มินิมอล โซลูชั่น จำกัด';
        } else if (type === 'government') {
            if (corporateFields) corporateFields.style.display = '';
            if (individualIdWrapper) individualIdWrapper.style.display = 'none';
            if (nameLabelText) nameLabelText.textContent = 'ชื่อผู้ประสานงาน / ผู้แทนหน่วยงาน';
            if (nameInput) nameInput.placeholder = 'สมชาย ใจดี (หัวหน้าฝ่ายสารสนเทศ)';
            if (companyNameLabel) companyNameLabel.textContent = 'ชื่อหน่วยงานราชการ / รัฐวิสาหกิจ';
            if (companyNameInput) companyNameInput.placeholder = 'การไฟฟ้านครหลวง / กรมพัฒนาธุรกิจการค้า';
        }
        checkAllValidations();
    }

    customerTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateCustomerTypeUI);
    });

    // Branch type toggle
    branchTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'branch') {
                if (branchCodeWrapper) branchCodeWrapper.style.display = '';
            } else {
                if (branchCodeWrapper) branchCodeWrapper.style.display = 'none';
                if (branchCodeInput) {
                    branchCodeInput.value = '00000';
                    branchCodeInput.classList.remove('is-invalid', 'is-valid');
                }
            }
            checkAllValidations();
        });
    });

    // --- Instant Modulo 11 Formatting & Validation on Typing ---
    function setup13DigitInput(inputEl, feedbackEl, validFeedbackEl, label) {
        if (!inputEl) return;

        inputEl.addEventListener('input', function (e) {
            const raw = e.target.value.replace(/\D/g, '').substring(0, 13);
            e.target.value = format13Digits(raw);

            // Instant validation feedback on typing
            if (raw.length === 13) {
                validateField(inputEl, feedbackEl, (val) => validateThai13Digits(val, label), validFeedbackEl);
            } else if (raw.length > 0) {
                inputEl.classList.remove('is-valid');
                inputEl.classList.add('is-invalid');
                const parent = inputEl.closest('.input-group');
                if (parent) { parent.classList.remove('is-valid'); parent.classList.add('is-invalid'); }
                if (feedbackEl) feedbackEl.textContent = `กรอก ${raw.length}/13 หลัก`;
                if (validFeedbackEl) validFeedbackEl.style.display = 'none';
                checkAllValidations();
            } else {
                inputEl.classList.remove('is-valid', 'is-invalid');
                const parent = inputEl.closest('.input-group');
                if (parent) parent.classList.remove('is-valid', 'is-invalid');
                if (feedbackEl) feedbackEl.textContent = '';
                if (validFeedbackEl) validFeedbackEl.style.display = 'none';
                checkAllValidations();
            }
        });

        inputEl.addEventListener('blur', function () {
            validateField(inputEl, feedbackEl, (val) => validateThai13Digits(val, label), validFeedbackEl);
        });
    }

    setup13DigitInput(idCardInput, idCardFeedback, idCardValidFeedback, 'เลขบัตรประชาชน');
    setup13DigitInput(taxIdInput, taxIdFeedback, taxIdValidFeedback, 'เลขประจำตัวผู้เสียภาษี');

    // Phone input auto-format
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let rawValue = this.value.replace(/\D/g, '').substring(0, 10);
            let formattedValue = rawValue;
            if (rawValue.length > 6) {
                formattedValue = `${rawValue.substring(0, 3)}-${rawValue.substring(3, 6)}-${rawValue.substring(6)}`;
            } else if (rawValue.length > 3) {
                formattedValue = `${rawValue.substring(0, 3)}-${rawValue.substring(3)}`;
            }
            this.value = formattedValue;
            validateField(phoneInput, phoneFeedback, validations.phone);
        });
    }

    // Branch code numeric only
    if (branchCodeInput) {
        branchCodeInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').substring(0, 5);
            validateField(branchCodeInput, document.getElementById('branchCodeFeedback'), validations.branch_code);
        });
    }

    // Standard inputs listeners
    if (nameInput) nameInput.addEventListener('input', () => validateField(nameInput, nameFeedback, validations.name));
    if (emailInput) emailInput.addEventListener('input', () => validateField(emailInput, emailFeedback, validations.email));
    if (companyNameInput) companyNameInput.addEventListener('input', () => validateField(companyNameInput, companyNameFeedback, validations.company_name));
    if (addressInput) addressInput.addEventListener('input', () => validateField(addressInput, addressFeedback, validations.address));
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            validateField(passwordInput, passwordFeedback, validations.password);
            if (passwordConfirmationInput && passwordConfirmationInput.value) {
                validateField(passwordConfirmationInput, passwordConfirmationFeedback, validations.password_confirmation);
            }
        });
    }
    if (passwordConfirmationInput) {
        passwordConfirmationInput.addEventListener('input', () => {
            validateField(passwordConfirmationInput, passwordConfirmationFeedback, validations.password_confirmation);
        });
    }
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', checkAllValidations);
    }

    // Password Toggle with Font Awesome
    const passwordToggles = document.querySelectorAll('.form-password-toggle .input-group-text');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const pwdInput = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            if (!pwdInput) return;
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            } else {
                pwdInput.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            }
        });
    });

    // Initial trigger
    updateCustomerTypeUI();
    checkAllValidations();
});
