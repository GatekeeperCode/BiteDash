# BiteDash 

##### Eat without the wait

## Installation instructions:

1. Install NPM & Node.js on your machine: [Download Here](nodejs.org/en/download)

2. Create a react app using: 

    - `npx create-react-app bitedash`

3. Clone the repository into the location where you created the react app

4. Run the following commands in the terminal:

    - `npm i react-router-dom --save styled-components`
    - `npm install react-icons`
    - `npm install babel-plugin-macros`
    - `npm install firebase`
    - `npm install eslint --global`
    - `npm install --save igniteui-react-core`
    - `npm install --save igniteui-react-gauges`
    - `npm install @mui/material @emotion/react @emotion/styled`
    - `npm install @mui/x-date-pickers`
    - `npm install dayjs`
    - `npm install --save react-big-calendar`
    - `npm update react-big-calendar`
    - `npm install react-phone-number-input --save`

5. Install Firebase Functions and other dependencies
    - `npm install firebase-tools`
    - `firebase login` (login with your google account connected to firebase)
    - `firebase init` Used to get dependencies. Select overwrite, and N when asked to overwrite a file.
    - `npm install react-bootstrap bootstrap` May be necessary to allow react-boostrap to function

6. Start the application using:

    - `npm start`

6. Install Firebase

    - `npm install -g firebase-tools`

7. Log In to Firebase (Use google account connected to the firebase project)

    -`firebase login`

8. Initalize Firebase Project Functions (Done in a terminal that is being run as Administrator)
        a. Find the bitedash project in first menu to connect to the project
        b. When writing files, select `Overwrite` and respond `N` when ased to overwrite files
        c. Respond `Y` when asked to install dependencies

    -`firebase init functions`
9. Further Support for Firebase Functions 

   - In order to actually test the python firebase functions in development you will need to install the following
     in your python location on your IDE 
   - `C:/Users/YOUR_USERNAME_HERE/AppData/Local/Programs/Python/Python311/Lib/site-packages`
   - Note target can be utilized in CMD Prompt (i.e pip install --target="YOUR/IDE/PYTHON/SITE/PACKAGES" SomePackage)
   - `pip install firebase`
   - `pip install firebase admin`
   - `pip install beautifulsoup4` this is needed for scrape.py

10. SSO Setup
    -`npm install @azure/msal-browser @azure/msal-react`
11. Email Setup

    -`npm install --save cors nodemailer`

    -`firebase functions:config:set outlook.sender=OUR_SERVICE_EMAIL@gcc.edu outlook.password=OUR_SERVICE_PASSWORD`

12. VM setup
    - The VM uses tmux to keep a session active at all times
    - `tmux attach` this opens the session from the terminal
    - <Ctrl b> is the "leader key" where you use that in combination with another to execute a tmux command
    - <Ctrl b + c> makes a new tmux "panel"
    - <Ctrl b + n> goes to the next available panel
    - <Ctrl b + p> goes to the previous available panel
    - `HTTPS=true npm start` is to run the server on the VM
    - Git is installed in the VM
    - Most Git commands will require an auth key as a password found in: Settings -> Developer Settings -> Personal Access Tokens -> Tokens (classic)
    - `git branch -al` shows all branches
    - `git branch <branch_name>` create a new branch
    - `git switch <branch_name>` switch to a branch

13. SMS Setup
    - `npm install twilio`
    - `firebase functions:config:set twilio.account_sid=`
    - `firebase functions:config:set twilio.auth_token=`
    - `firebase functions:config:set twilio.phone_number=` 
 

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
