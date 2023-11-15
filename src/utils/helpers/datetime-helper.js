function compareDate(date1str,date2str){
    let dateTime1 = new Date(date1str);
    let dateTime2 = new Date(date2str);
    return dateTime1.getTime() > dateTime2.getTime();
}

module.exports = {
    compareDate
}