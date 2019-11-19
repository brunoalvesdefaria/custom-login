import React from 'react';
import { withFormik, Field } from 'formik';
import auth0 from 'auth0-js';
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
      .required('Password confirmation is required!'),
    experience: Yup.string()
      .required('Years of experience is required!'),
    username: Yup.string()
      .required('Username is required!'),
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

    const { config } = props;

    const params = Object.assign({
      /* additional configuration needed for use of custom domains */
      overrides: {
        __tenant: config.auth0Tenant,
        __token_issuer: config.authorizationServer.issuer,
        __jwks_uri: `${config.authorizationServer.issuer}.well-known/jwks.json`
      },
      //
      domain: config.auth0Domain,
      clientID: config.clientID,
      redirectUri: config.callbackURL,
      responseType: 'code'
    }, config.internalOptions);

    // Initialize client
    const webAuth = new auth0.WebAuth(params);
    
    const options = { 
      connection: "Username-Password-Authentication",
      email, 
      password,
      username,
      given_name: firstName,
      family_name: lastName,
      name: `${firstName} ${lastName}`,
      nickname: username,
      user_metadata: {
        occupation: profession.value,
        experience,
        team: residencyProgram.value,
        // Note: for some reason, Auth0 wants these as Strings
        notificationOfDataRelease: notificationOfDataRelease.toString(),
        consent: consent.toString()
      }
    };

    webAuth.redirect.signupAndLogin(options, function (err) { 
      if (err) {
        alert(`Something went wrong: ${err.message}`);
        throw new Error(err.message); 
      }
    });
    setSubmitting(false);
  },
  displayName: 'SignUpForm',
});

const SignUpForm = (props) => {
  const {
    values,
    touched,
    errors,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
  } = props;

  return (
    <div className="SignUp">
      <h2>Sign up</h2>
      <a href="#login" className="link linkLoginInstead">Log in instead →</a>
      <form onSubmit={handleSubmit}>
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
        <button
          type="submit"
          className="btn btnSignup"
          disabled={isSubmitting}>Sign up</button>
      </form>
    </div>
  );
};

const EnhancedSignUpForm = formikEnhancer(SignUpForm);


export default EnhancedSignUpForm;