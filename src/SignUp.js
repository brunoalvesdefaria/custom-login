import React from 'react';
import { withFormik, Field } from 'formik';
import { Auth } from 'aws-amplify';
import * as Yup from 'yup';
import './SignUp.css';
import ConsentFactSheet from './ConsentFactSheet.js';
import CustomSelect from './CustomSelect.js';
import residencyProgram from './residencyProgram.js';
import profession from './profession.js';
import { RadioButton, RadioButtonGroup } from './Radio.js';
import getUsername from './getUsername.js';

const randomNames = [
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
  getUsername(),
];

const yearsOfExperienceOptions = [
  { value: "lessThan5", label: "<5" },
  { value: "fiveToTen", label: "5-10" },
  { value: "moreThan10", label: ">10" },
]

const formikEnhancer = withFormik({
  validationSchema: Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required!'),
    profession: Yup.string()
      .required('Profession is required!'),
    residencyProgram: Yup.string()
      .required('U.S. Hospital or Country is required!'),
    firstName: Yup.string(),
    lastName: Yup.string(),
    password: Yup.string()
      .required('Password is required!'),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Password confirmation is required!'),
    experience: Yup.string()
      .required('Years of experience is required!'),
    username: Yup.string()
      .required('Username is required!'),
    consent: Yup.bool()
      .oneOf([true], 'You must agree to sign up')
  }),
  mapPropsToValues: props => ({
    email: '',
    profession: '',
    residencyProgram: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirm: '',
    experience: '',
    notificationOfDataRelease: false,
    consent: false,
    username: randomNames[0] 
  }),
  handleSubmit: (values, { props, setSubmitting }) => {
    console.log(JSON.stringify(values, null, 2));
    const { email,
      password,
      firstName,
      lastName,
      residencyProgram,
      profession,
      experience,
      notificationOfDataRelease,
      username,
      consent } = values;

    const options = { 
      password,
      username,
      attributes: {
        email,
        given_name: firstName || username.split('.')[0],
        family_name: lastName || username.split('.')[1],
        name: `${firstName} ${lastName}`,
        nickname: username,
        'custom:occupation': profession.value,
        'custom:experience': experience.value,
        'custom:team': residencyProgram.value,
        'custom:data': notificationOfDataRelease.toString(),
        'custom:consent': consent.toString()
      }
    };

    Auth.signUp(options).then(user => {
      console.log(user)

      console.warn('Done! Redirect?');

      window.location = 'https://cancer.crowds-cure.org/'
    }).catch(err => {
      if (err) {
        alert(`Something went wrong: ${err.message}`);
        throw new Error(err.message); 
      }
    });
    setSubmitting(false);
  },
  displayName: 'SignUpForm',
  validateOnMount: true,
});

class SignUpForm extends React.Component {
  constructor() {
    super();

    this.redirectToLogin = this.redirectToLogin.bind(this);
  }

  redirectToLogin() {
    this.props.togglePage('login');
  }

  renderHeader() {
    return (
      <>
        <h2>Sign up</h2>
        <button
          className="link linkLoginInstead"
          onClick={this.redirectToLogin}
        >Log in instead →</button>
      </>
    );
  }

  renderRealNameSection() {
    return (
      <div className="section">
        <h3>1. Real name (optional)</h3>
        <p>If entered, your name will appear on the public leaderboard.</p>
        <hr />
        <Field name="firstName">
          {({ field, form, meta }) => (
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input type="text"
                {...field}
                placeholder="First name (optional)"
                autoComplete="given-name"/>
              {meta.touched &&
                meta.error && <div className="error">{meta.error}</div>}
            </div>
          )}
        </Field>
        <Field name="lastName">
          {({ field, form, meta }) => (
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input type="text"
                {...field}
                placeholder="Last name (optional)"
                autoComplete="family-name"/>
              {meta.touched &&
                meta.error && <div className="error">{meta.error}</div>}
            </div>
          )}
        </Field>
      </div>
    );
  }

  renderUserNameSection() {
    const { values, errors, touched } = this.props;

    return (
      <div className="section">
        <h3>2. User name</h3>
        <p>Displayed on the public leaderboard, if you did not enter a real name.</p>
        <hr />
        <div className="fields">
          <RadioButtonGroup
            id="username"
            value={values.username}
            error={errors.username}
            touched={touched.username}
          >
            {randomNames.map(name => (
              <Field
                key={name}
                id={name}
                component={RadioButton}
                name="username"
                label={name}
                required={true}
              />
            ))}
          </RadioButtonGroup>
        </div>
      </div>
    );
  }

  renderLoginInformationSection() {
    return (
      <div className="section">
        <h3>3. Login information</h3>
        <hr />
        <div className="fields">
          <Field name="email">
            {({ field, form, meta }) => (
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input type="email"
                  {...field}
                  required
                  placeholder="Email address"
                  autoComplete="email"/>
                {meta.touched &&
                  meta.error && <div className="error">{meta.error}</div>}
              </div>
            )}
          </Field>
          <Field name="password">
            {({ field, form, meta }) => (
              <div className="field">
                <label htmlFor="password">Password</label>
                <input type="password"
                  {...field}
                  required
                  placeholder="Password"
                  autoComplete="new-password"/>
                {meta.touched &&
                  meta.error && <div className="error">{meta.error}</div>}
              </div>
            )}
          </Field>
          <Field name="passwordConfirm">
            {({ field, form, meta }) => (
              <div className="field">
                <label htmlFor="passwordConfirm">Confirm password</label>
                <input type="password"
                  {...field}
                  required
                  placeholder="Confirm password"/>
                {meta.touched &&
                  meta.error && <div className="error">{meta.error}</div>}
              </div>
            )}
          </Field>
        </div>
      </div>
    );
  }

  renderExperienceSection() {
    const {
      values,
      setFieldValue,
      setFieldTouched,
      errors,
      touched
    } = this.props;

    return (
      <div className="section">
        <h3>4. Experience</h3>
        <hr />
        <div className="fields">
          <CustomSelect
            value={values.profession}
            fieldName={'profession'}
            label={'Profession'}
            options={profession}
            onChange={setFieldValue}
            onBlur={setFieldTouched}
            error={errors.profession}
            touched={touched.profession}
            required={true}
          />
          <CustomSelect
            value={values.experience}
            fieldName={'experience'}
            label={'Years of experience'}
            options={yearsOfExperienceOptions}
            onChange={setFieldValue}
            onBlur={setFieldTouched}
            error={errors.experience}
            touched={touched.experience}
            required={true}
          />
          <CustomSelect
            value={values.residencyProgram}
            fieldName={'residencyProgram'}
            label={'U.S. Hospital or Country'}
            options={residencyProgram}
            required={true}
            onChange={setFieldValue}
            onBlur={setFieldTouched}
            error={errors.residencyProgram}
            touched={touched.residencyProgram}
          />
        </div>
      </div>
    );
  }

  renderConsentSection() {
    const { values } = this.props;

    return (
      <div className="section">
        <h3>5. Consent and notifications</h3>
        <hr />
        <div className="textScroll">
          <ConsentFactSheet/>
        </div>
        <Field name="consent">
          {({ field, form, meta }) => (
            <div className="Checkbox">
              <input
                id="consent"
                type="checkbox"
                { ...field }
                required
                defaultChecked={values.consent}
              />
              <label htmlFor="consent">
                <span>I have read and agree to the consent fact sheet (above) and the </span>
                <a className="link linkPrivacy" href="#privacy">Privacy policy</a>
              </label>
              {meta.touched &&
                meta.error && <div className="error">{meta.error}</div>}
            </div>
          )}
        </Field>
        <Field name="notificationOfDataRelease">
          {({ field, form, meta }) => (
            <div className="Checkbox">
              {/* Right now this is the only field that is not required. */}
              <input
                id="notificationOfDataRelease"
                name="notificationOfDataRelease"
                type="checkbox"
                { ...field}
                defaultChecked={values.notificationOfDataRelease}
                value={values.notificationOfDataRelease}
              />
              <label htmlFor="notificationOfDataRelease">Notify me when data is released</label>
              {meta.touched &&
                meta.error && <div className="error">{meta.error}</div>}
            </div>
          )}
        </Field>
      </div>
    );
  }

  getSignupButtonDisabledClass() {
    const { isSubmitting, errors } = this.props;
    const hasErrors = Object.keys(errors).length > 0;
    return isSubmitting || hasErrors ? 'disabled' : '' ;
  }

  render() {
    const { handleSubmit, isSubmitting } = this.props;

    return (
      <div className="SignUp">
        {this.renderHeader()}
        <form onSubmit={handleSubmit}>
          {this.renderRealNameSection()}
          {this.renderUserNameSection()}
          {this.renderLoginInformationSection()}
          {this.renderExperienceSection()}
          {this.renderConsentSection()}
          <button
            type="submit"
            className={`btnSignup btn ${this.getSignupButtonDisabledClass()}`}
            disabled={isSubmitting}
          >Sign up</button>
        </form>
      </div>
    );
  }
}

const EnhancedSignUpForm = formikEnhancer(SignUpForm);


export default EnhancedSignUpForm;