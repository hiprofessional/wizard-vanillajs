class MyWizard {
    constructor(containerElement, steps, options = {}) {
        this.containerElement = containerElement;
        this.steps = steps;
        this.options = Object.assign({
            stepsSelector: '.steps',
            nextButtonSelector: '.next-btn',
            activeStepId: 1
        }, options);
        this.Status = {
            Active: 1,
            Inactive: 2,
            Done: 3
        };
        Object.freeze(this.Status);

        this.init();
    }

    init() {
        this.initNextButtonClick();
        this.initStatuses();
        this.renderSteps();
        this.visiblityForFormById(this.options.activeStepId, true);
    }

    initNextButtonClick() {
        this.containerElement.querySelector(this.options.nextButtonSelector).addEventListener('click', ()=>{
            this.nextStep();
        })
    }

    nextStep() {
        let currentIndex = this.steps.findIndex(el => el.Status == this.Status.Active);
        if (currentIndex == -1) {
            return;
        }
        if (!this.isStepValid(this.steps[currentIndex])) {
            return;
        }

        this.makeAction(this.steps[currentIndex]);

        let currentStepId = this.steps[currentIndex].Id;
        this.steps[currentIndex].Status = this.Status.Done;
        this.updateStep(this.steps[currentIndex]);
        if (currentIndex < this.steps.length -1) {
            this.visiblityForFormById(currentStepId, false);
            ++currentIndex;
            currentStepId = this.steps[currentIndex].Id;
            this.steps[currentIndex].Status = this.Status.Active;
            this.updateStep(this.steps[currentIndex]);
            this.visiblityForFormById(currentStepId, true);
        }
        // this.renderSteps();
    }

    isStepValid(step) {
        if (step.validationFn) {
            return step.validationFn();
        }
        return true;
    }

    makeAction(step) {
        if (step.Action) {
            step.Action();
        }
    }

    visiblityForFormById(currentStepId, isVisible) {
        const selector = `.form[data-form-id="${currentStepId}"]`;
        const form = this.containerElement.querySelector(selector);
        if (isVisible) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    }

    initStatuses() {
        let hasActiveStep = false;
        this.steps.forEach(step => {
            if (step.Id == this.options.activeStepId) {
                step.Status = this.Status.Active;
                hasActiveStep = true;
            } else if(hasActiveStep) {
                step.Status = this.Status.Inactive;
            } else {
                step.Status = this.Status.Done;
            }
        });
    }

    renderSteps() {
        let result = this.steps.map(step => {
            const className = this.getClassName(step.Status);
            const item = `
            <div class="step ${className}" data-step-id="${step.Id}">
                <div class="step__header">${step.Header}</div>
                <div class="step__point">
                  <div class="pre-line">
                    <div class='pre-line__filler'></div>
                  </div>
                  <div class="point">
                    <div class='point__filler'></div>
                  </div>
                  <div class="post-line">
                    <div class='post-line__filler'></div>
                  </div>
                </div>
              </div>
            `;
            return item;
        })
        this.containerElement.querySelector(this.options.stepsSelector).innerHTML = result.join('');
    }

    updateStep(step) {
        const stepContainer = this.containerElement.querySelector(`.step[data-step-id="${step.Id}"]`);
        const className = this.getClassName(step.Status);
        stepContainer.classList.forEach(el => {
            if (el !== 'step') {
                stepContainer.classList.remove(el);
            }
        })
        stepContainer.classList.add(className);
    }

    getClassName(status) {
        let result = '';
        switch (status) {
            case this.Status.Active:
                result = 'active';
                break;
            case this.Status.Done:
                result = 'done';
                break;
            case this.Status.Inactive:
                result = 'inactive';
        }
        return result;
    }
}
let allData = {};
function action1() {
    allData.form1 = {
        userName: document.forms.userNameForm.elements['userName'].value
    }
}
function action2() {
    allData.form2 = {
        userName: document.forms.userEmailForm.elements['email'].value
    }
}
function action3() {
    const debug = document.querySelector('.debug');
    debug.innerHTML = JSON.stringify(allData);
}

function isValidForm1() {
    const form = document.forms.userNameForm;
    const inputs = form.querySelectorAll('input');
    let isFormValid = true;
    inputs.forEach(input => {
        if (!input.validity.valid) {
            isFormValid = false;
        }
    })
    return isFormValid;
}

const steps = [
    {
        Id: 1,
        Header: 'Profile',
        Action: action1,
        validationFn: isValidForm1
    },
    {
        Id: 2,
        Header: 'Check <br> something',
        Action: action2,
    },
    {
        Id: 3,
        Header: 'Finish',
        Action: action3,
    },
];

let wizardContainer = document.querySelector('.steps__container');
let wizard = new MyWizard(wizardContainer, steps, { activeStepId: 1});