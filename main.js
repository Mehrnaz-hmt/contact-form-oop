function firstNameValidator(value) {
  if (!value) {
    throw "first name is required!";
  }

  if (value.length > 30) {
    throw "first name must less than 30 character!";
  }
}

function lastNameValidator(value) {
  if (!value) {
    throw "last name is required!";
  }
}

function phoneNumberValidator(value) {
  if (value.length !== 11) {
    throw "phone number must be 11 character!";
  }

  if (isNaN(Number(value))) {
    throw "there is some invalid character!";
  }
}

class Contact {
  constructor(formData) {
    const validFieldNames = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "gender",
      "nationality",
    ];
    for (const [name, value] of formData) {
      if (validFieldNames.includes(name)) {
        this[name] = value;
      }
    }
    validFieldNames.forEach((propName) => {
      if (!this.hasOwnProperty(propName)) {
        this[propName] = null;
      }
    });
  }

  getFullName() {
    return this.firstName + " " + this.lastName;
  }

  createRowHtml(index) {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${this.getFullName()}</td>
        <td>${this.email}</td>
        <td>${this.phone}</td>
        <td>${this.gender}</td>
        <td>${this.nationality}</td>
        <td>
          <button data-index="${index}" type="button" class="btn btn-danger delete-btn">Delete</button>
        </td>
      </tr>
    `
  }

  static validate(formData) {
    const errors = []
    for (const [name, value] of formData) {
      try {
        switch (name) {
          case "firstName":
            firstNameValidator(value);
            break;
          case "lastName":
            lastNameValidator(value);
            break;
          case "phone":
            phoneNumberValidator(value);
            break;
        }
      } catch (err) {
        const error = {
            fieldName: name,
            message: err
        }
        errors.push(error)
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

class ContactList {
  list = []

  constructor() {
    this.tableElement = document.getElementById('contact-list');
  }

  add(contact) {
    this.list.push(contact)
    this.refresh();
  }

  remove(index) {
    this.list.splice(index, 1);
    this.refresh();
  }

  refresh() {
    this._removeAllRow()
    const rowsHtml = this.list.map((c, i) => c.createRowHtml(i)).join('');
    this._changeTableBody(rowsHtml)
    this._setDeleteEventListeners()
  }

  _removeAllRow() {
    this.tableElement
    .querySelector('tbody')
    .querySelectorAll('tr')
    .forEach(c => c.remove());
  }

  _changeTableBody(content) {
    this.tableElement
    .querySelector('tbody')
    .innerHTML = content
  }

  _setDeleteEventListeners() {
    this.tableElement
    .querySelectorAll('.delete-btn')
    .forEach(btn => btn.addEventListener('click', this._handleClickDelete.bind(this)))
  }

  _handleClickDelete(event) {
    const targetIndex = event.target.dataset.index
    this.remove(targetIndex)
  }

}

const contactsTable = new ContactList();

function showValidationError(fieldError) {
  const inputElem = document.querySelector(`input[name="${fieldError.fieldName}"]`)
  inputElem.classList.add("is-invalid")
  const errorElement = document.createElement("div");
  errorElement.className = "invalid-feedback"
  errorElement.innerText = fieldError.message
  inputElem.parentElement.append(errorElement)
}

function handleSubmit(e) {
  e.preventDefault();
  const formElement = e.target;
  
  formElement.querySelectorAll(".is-invalid").forEach(el => {
    el.classList.remove("is-invalid")
  })
  
  formElement.querySelectorAll(".invalid-feedback").forEach(el => {
    el.remove();
  })
  
  formElement.classList.add("was-validated");
  
  if (!formElement.checkValidity()) {
    return;
  }
  
  const formData = new FormData(formElement);
  const validationResult = Contact.validate(formData)

  if (!validationResult.isValid) {
    formElement.classList.remove("was-validated");
    validationResult.errors.forEach(err => showValidationError(err))
    return;
  }

  const contact = new Contact(formData);
  contactsTable.add(contact)
}
