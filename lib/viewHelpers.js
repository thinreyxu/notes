module.exports = function (app) {
  app.locals.formatDate = function (date, format) {
    var date = date instanceof Date ? date : new Date(date);
    return format.replace(/[a-zA-Z]+/g, function ($0) {
      switch($0) {
        case 'YYYY':
          return date.getFullYear();
        case 'MM':
          return toDoubleDate(date.getMonth() + 1);
        case 'DD':
          return toDoubleDate(date.getDate());
        case 'hh':
          return toDoubleDate(date.getHours());
        case 'mm':
          return toDoubleDate(date.getMinutes());
        case 'ss':
          return toDoubleDate(date.getSeconds());
        default:
          return $0;
      }
    });
  };

  function toFixed (str, width, supplement) {
    supplement += '';
    str += '';
    var diff = width - str.length;
    if (diff > 0) {
      var newSup = new Array(Math.ceil(diff / supplement.length) + 1).join(supplement);
      newSup = newSup.substring(newSup.length - diff);
      return newSup + str;
    }
    return str;
  }

  function toDoubleDate (str) {
    return toFixed(str, 2, '0');
  }
};