/**
 * params
 * date [JS Date()]
 * day_in_week [int] 1 (Mon) - 7 (Sun)
 */
const nextWeekDayDate = (date, day_in_week, diff = 0) => {
    var ret = new Date(date||new Date());
    ret.setDate(ret.getDate() + (day_in_week - 1 - ret.getDay() + 7) % 7 + 1 + diff);
    return ret;
}

module.exports = nextWeekDayDate