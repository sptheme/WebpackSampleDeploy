require('../styles/app.scss');

class Form {
    constructor() {
        console.log('Yha! Form class are great!!!');
    }
}

new Form();


// For development part
if (process.env.NODE_ENV === 'development') {
    if (module.hot) {
        module.hot.accept();
    }
}
