module.exports.errorMessages = function(error) {
    var messages = [];
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                messages.push('Email address is already in use');
                break;
            default:
                messages.push('Something went wrong');
        }
    } else {
        for (var key in error.errors) {
            if (error.errors.hasOwnProperty(key)) {
                messages.push(error.errors[key].message);
            }
        }
    }

    if (messages.length == 0) {
        messages.push('Something went wrong');
    }

    return messages;
}