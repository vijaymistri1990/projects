const html_entity_decode_json = require("./html_entity_decode.json");
function mysql_real_escape_string(str) {
    if (str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case '"':
                    return '""';
                case "'":
                    return "''"
                case "\\":
                case "%":
                    return "\\" + char;
                /* prepends a backslash to backslash, percent,and double/single quotes*/
            }
        });
    }
    else {
        return "";
    }

}

function trim(str, charlist) {
    let whitespace = [
        ' ',
        '\n',
        '\r',
        '\t',
        '\f',
        '\x0b',
        '\xa0',
        '\u2000',
        '\u2001',
        '\u2002',
        '\u2003',
        '\u2004',
        '\u2005',
        '\u2006',
        '\u2007',
        '\u2008',
        '\u2009',
        '\u200a',
        '\u200b',
        '\u2028',
        '\u2029',
        '\u3000'
    ].join('')
    let l = 0
    let i = 0
    str += ''

    if (charlist) {
        whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
    }

    l = str.length
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i)
            break
        }
    }

    l = str.length
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1)
            break
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
}
const generateRandomString = (length = 15, char_type = 1) => {
    let characters = {
        '1': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '2': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '3': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + Date.now()
    }
    let characters_str = characters[char_type], charactersLength = characters_str.length, randomString = '', i = 0;
    for (; i < length; i++) {
        randomString += characters_str[getRndInteger(0, charactersLength - 1)];
    }
    return randomString;
}

const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function date_format(formate_type, date = '', is_unix = false) {
    let dt = (date) ? new Date(date) : new Date();
    if (is_unix) { /** strtotimer to date formate */
        dt = new Date(date * 1000);
    }
    let Y = dt.getFullYear();
    let m = ('0' + (Number(dt.getMonth() + 1))).slice(-2);
    let d = ('0' + dt.getDate()).slice(-2);
    let H = dt.getHours();
    let i = dt.getMinutes();
    let s = dt.getSeconds();
    let month_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let M = month_arr[m - 1];
    let date_string = '';

    switch (formate_type) {
        case 'Y/m/d':
            date_string = `${Y}/${m}/${d}`;
            break;
        case 'Y-m-d':
            date_string = `${Y}-${m}-${d}`;
            break;
        case 'Y M d':
            date_string = `${Y} ${M} ${d}`;
            break;
        case 'd/m/Y':
            date_string = `${d}/${m}/${Y}`;
            break;
        case 'd-m-Y':
            date_string = `${d}-${m}-${Y}`;
            break;
        case 'd M Y':
            date_string = `${d} ${M} ${Y}`;
            break;
        case 'M d Y':
            date_string = `${M} ${d} ${Y}`;
            break;
        case 'm/d/Y':
            date_string = `${m}/${d}/${Y}`;
            break;
        case 'm-d-Y':
            date_string = `${m}-${d}-${Y}`;
            break;
        case 'H:i:s':
            date_string = `${H}:${i}:${s}`;
            break;
        case 'H:i':
            date_string = `${H}:${i}`;
            break;
        case 'Y-m-d H:i:s':
            date_string = `${Y}-${m}-${d} ${H}:${i}:${s}`;
            break;
        case 'Y-m-d H':
            date_string = `${Y}-${m}-${d} ${H}`;
            break;
        case 'Y-m-d H:i':
            date_string = `${Y}-${m}-${d} ${H}:${i}`;
            break;
        case 'm/d':
            date_string = `${m}/${d}`;
            break;
        case 'm':
            date_string = m;
            break;
        case 'd':
            date_string = d;
            break;
        case 'Y':
            date_string = Y;
            break;
        case 'dmy_His':
            date_string = `${d}${m}${Y}_${H}${i}${s}`;
            break;
        default:
            date_string = `${Y}-${m}-${d}`;
    }
    return date_string;
}

function replace_str_arr(replaceArray, replaceArrayValue, string) {
    let finalAns = string; let i = replaceArray.length - 1;
    for (; i >= 0; i--) {
        finalAns = finalAns.replace(RegExp("\\b" + replaceArray[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\b", "g"), replaceArrayValue[i]);
    }
    return finalAns;
}

function replace_chr_arr(replaceArray, replaceArrayValue, string) {
    let finalAns = string; let i = replaceArray.length - 1
    for (; i >= 0; i--) {
        finalAns = finalAns.replace(new RegExp(replaceArray[i], "g"), replaceArrayValue[i]);
    }
    return finalAns;
}

const timezone_date = (timezone, format = "", dates = "", timestamp = 0) => {
    timezone = isRealValue(timezone) ? timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
    let date = (dates) ? new Date(dates) : new Date();
    let track_date = date.toLocaleString('en-US', { timeZone: timezone.trim() });

    if (timestamp == 0) {
        track_date = date_format(format, track_date);
    } else if (timestamp == 1 && format != "") {
        track_date = new Date(date_format(format, track_date)).getTime()
    } else if (timestamp == 2) {
        track_date = new Date(track_date);
    } else if (timestamp == 3) {
        track_date = (new Date(track_date)).getTime();
    } else {
        track_date = Math.floor((new Date(track_date)).getTime() / 1000)
    }
    return track_date;
}

function isRealValue(obj) {
    const objStr = JSON.stringify(obj);
    return !!(obj && objStr != "[]" && objStr != "{}" && objStr != "[null]" && objStr.length > 0);
}
const in_array = (str, array) => {
    const toLowerCase = String.prototype.toLowerCase.call.bind(String.prototype.toLowerCase);
    array = array.map(toLowerCase);
    if (typeof str == 'string') {
        return array.indexOf(str.toLowerCase()) !== -1;
    } else if (!isNaN(str)) {
        return array.indexOf(str.toString().toLowerCase()) !== -1;
    } else {
        return array.indexOf(str) !== -1;
    }
};


function error_log_message(user_id = '0', type = '0', error = '', data = '', file_name = '', function_name = '') {
    let log_string = {},
        array = {};
    if (error) {
        log_string.error = error.stack;
    }
    log_string.file_name = file_name;
    log_string.function_name = function_name;
    log_string.type = type;
    log_string.data = data;

    if (user_id) {
        array['user_id'] = user_id.toString();
    }
    array['type'] = type;
    array['log'] = JSON.stringify(log_string).replace(/'/gi, ''); /* remove single ' for insert db in error log*/
    return array;
}

const array_intersect = (arr1, arr2, is_bool = false) => {
    let result = [];
    let i = 0;
    const arr1Len = arr1.length;
    const arr2Len = arr2.length;
    for (; i < arr1Len; i++) {
        const value1 = arr1[i];
        let j = 0;
        for (; j < arr2Len; j++) {
            const value2 = arr2[j];
            if (value1 == value2) {
                result.push(value1);
            }
        }
    }
    if (is_bool && result.length > 0) {
        return true;
    }
    if (result.length === 0) {
        return false;
    }
    return result;
};


const array_column = (data, col_key, index_key = null,need_arr_format= false) => {
    let newArray = [];
    if (data && (typeof data == 'object' || (Array.isArray(data) && data.length))) {
        const data_key = Object.keys(data);
        const len = data_key.length;
        let key = 0;
        for (; key < len; key++) {
            if (index_key) {
                if(need_arr_format){
                    if(newArray[data[key][index_key]]){
                        let value = (col_key) ? data[key][col_key]: data[key];
                        newArray[data[key][index_key]].push(value)
                    }else{
                        newArray[data[key][index_key]] = (col_key) ? [data[key][col_key]] : [data[key]];
                    }
                }else{
                    newArray[data[key][index_key]] = (col_key) ? data[key][col_key] : data[key];
                }
            } else {
                newArray[key] = data[key][col_key];
            }
            newArray = (index_key) ? Object.assign({}, newArray) : newArray;
        }
    }
    return newArray;
};


const array_filter = (array) => {
    const temp = [];
    const len = array.length;
    let i = 0;
    for (; i < len; i++) {
        if (array[i] && array[i] != '0') {
            temp.push(array[i]);
        }
    }
    return temp;
};

const unique = (arr) => {
    const arr2 = [];
    const len = arr.length;
    let i = 0;
    for (; i < len; i++) {
        if (!arr2.includes(arr[i])) {
            arr2.push(arr[i]);
        }
    }
    return arr2;
};

const html_entity_decode = (str, quoteStyle = 1) => {
    /**
     * NOTE:- GD0100 (19-03-2021)
     * If find new special-chars then add into entities object.
     * ENT_COMPAT:Will convert double-quotes and leave single-quotes alone.
     * ENT_QUOTES:Will convert both double and single quotes.
     * ENT_NOQUOTES:Will leave both double and single quotes unconverted.
     */
    let OPTS = {
        'ENT_COMPAT': 1,
        'ENT_QUOTES': 2,
        'ENT_NOQUOTES': 3
    };
    let entities = html_entity_decode_json;
    if (typeof quoteStyle !== 'number') {
        quoteStyle = OPTS[quoteStyle];
    }
    if (quoteStyle != 3) {
        entities['&quot;'] = '"';
    }
    if (quoteStyle == 2) {
        entities['&#39;'] = "'";
    }
    if (str) {
        return str.replace(/&([^;]+);/gm, function (match) {
            return entities[match] || match;
        })
    }
    return str;
}

const str_replace = (r, v, str) => {
    if (r.length) {
        if (Array.isArray(r)) {
            if (Array.isArray(v)) {
                let temp = str;
                for (let i = r.length - 1; i >= 0; i--) {
                    temp = temp.replace(new RegExp(r[i], "g"), (v[i]) ? v[i] : (v[v.length - 1]) ? v[v.length - 1] : '');
                }
                return temp;
            } else {
                let temp = str;
                return temp.replace(new RegExp(r.join("|"), "g"), v);
            }
        } else {
            return str.replace(new RegExp(r, "g"), v);
        }
    } else {
        return str;
    }
}
const day_diff = (start_date, end_date) => {
    const date1 = new Date(start_date);
    const date2 = new Date(end_date);
    const diffTime = Math.abs(date2 - date1);
    return (Math.ceil(diffTime / (1000 * 60 * 60 * 24))) + 1;
}
const get_sql_range_str = (diff_day, start_date, column) => {
    let cust_t_point = 0;
    if (diff_day == 1) {
        cust_t_point = 1;
    } else if (diff_day <= 3) {
        cust_t_point = 1;
    } else {
        cust_t_point = 24;
    }
    let str = `floor((TIMESTAMPDIFF(HOUR, '${start_date}', ${column})) / ${cust_t_point}) AS custom_range`
    return { sql_str: str, cust_time_point: cust_t_point };
}
const get_dynamic_chart_js_variable = (diff_day) => {
    let dynamic_arr = {};
    if (diff_day == 1) {
        dynamic_arr['interval_hour'] = 4;
        dynamic_arr['xAxis_labels_formate'] = '%I%P';
        dynamic_arr['tooltip_labels_formate'] = '%e %b, %Y, %I%P';
    } else if (diff_day <= 3) {
        dynamic_arr['interval_hour'] = 12;
        dynamic_arr['xAxis_labels_formate'] = '%I%P';
        dynamic_arr['tooltip_labels_formate'] = '%e %b, %Y, %I%P';
    } else if (diff_day <= 7) {
        dynamic_arr['interval_hour'] = 24;
        dynamic_arr['xAxis_labels_formate'] = '%e %b';
        dynamic_arr['tooltip_labels_formate'] = '%e %b, %Y';
    } else {
        let day = 7;
        let interval_day = 0;
        let reminder = 0
        do {
            reminder = diff_day % day;
            interval_day = Math.ceil(diff_day / day);
            day--;
        } while (reminder <= 1);

        dynamic_arr['interval_hour'] = interval_day * 24;
        dynamic_arr['xAxis_labels_formate'] = '%e %b';
        dynamic_arr['tooltip_labels_formate'] = '%e %b, %Y';
    }

    return dynamic_arr;
}
const date_array_bet = (start_date, end_date, date_diff, hours, arr_label) => {
    let dateformat = (hours == 1) ? "Y-m-d H:i:s" : "Y-m-d";
    let date_arr = {};
    let newdate = start_date;
    let key = (date_diff <= 3) ? 24 * date_diff : date_diff;
    while (key--) {
        let date = new Date(newdate);
        newdate = date.setHours(date.getHours() + hours);
        date_arr[Date.parse(date_format(dateformat, newdate))] = { [arr_label[0]]: 0, [arr_label[1]]: 0 }
    }
    return date_arr;
}
const base64Encode = (str) => {
    return Buffer.from(str).toString("base64");
}
const base64Decode = (str) => {
    return Buffer.from(str, 'base64').toString('utf8');
}

const funnel_valid_check = (funnel_arr) => {
    let response = { "valid_status": false }
    let err_msg = ``;
    let funnel_arr_len = funnel_arr.length;
    let json_check = {
        "NOT_CHECK_CONDITION": ['9', '10'],
        "CHECK_BETWEEN_NOT_CONDITION": ['3', '4'],
        "CHECK_NUMBERS": ["1.2", "1.3"],
        "CHECK_INTEGER": ["1.3"],
        "CHECK_FLOAT": ["1.2"],
        "ALL_ORDERS": ["1.1"]
    }
    while (funnel_arr_len--) {
        const condition_val_type = `${funnel_arr[funnel_arr_len].category}.${funnel_arr[funnel_arr_len].parameter}`
        if (condition_val_type != json_check.ALL_ORDERS && (json_check.NOT_CHECK_CONDITION).indexOf(funnel_arr[funnel_arr_len].condition) == -1) {
            if (funnel_arr[funnel_arr_len].condition_values && funnel_arr[funnel_arr_len].back_conditions_values) {
                if ((json_check.CHECK_BETWEEN_NOT_CONDITION).indexOf(funnel_arr[funnel_arr_len].condition) != -1) {
                    const condition_val_arr = ((funnel_arr[funnel_arr_len].condition_values).indexOf("@$@") != -1) ? (funnel_arr[funnel_arr_len].condition_values).split("@$@") : [];
                    if (condition_val_arr.length > 0 && !isNaN(condition_val_arr[0]) && !isNaN(condition_val_arr[1])) {
                        continue;
                    } else {
                        err_msg += `<li> Please provide valid values for ${funnels_obj[funnel_arr[funnel_arr_len].category][funnel_arr[funnel_arr_len].parameter]};</li>`
                    }
                } else if ((json_check.CHECK_NUMBERS).indexOf(condition_val_type) != -1 && isNaN(funnel_arr[funnel_arr_len].condition_values)) {
                    err_msg += `<li> Please provide valid values for ${funnels_obj[funnel_arr[funnel_arr_len].category][funnel_arr[funnel_arr_len].parameter]};</li>`
                } else if ((json_check.CHECK_NUMBERS).indexOf(condition_val_type) != -1 && !isNaN(funnel_arr[funnel_arr_len].condition_values)) {
                    continue;
                }
            } else {
                err_msg += `<li>Please provide necessary values for ${funnels_obj[funnel_arr[funnel_arr_len].category][funnel_arr[funnel_arr_len].parameter]};</li>`
            }
        }
    }
    if (err_msg) {
        response.valid_status = false
        response.msg = err_msg
    } else {
        response.valid_status = true
        response.msg = err_msg
    }
    return response;
}
const trigger_condition_define = () => ({
    'is_isnot': ["1", "2"],    /* 1: is & 2: is_not */
    'between_not_arr': ["3", "4"], /* 3: between & 4: not_between  */
    'less_more': ["5", "6"], /* 5: less_than & 6: more_than  */
    'contain_not_contain': ["7", "8"], /* 7: contains & 8: does_not_contains  */
    'empty_not_empty': ["9", "10"], /* 9: empty & 10: not_empty  */
    'start_end_with': ["11", "12"] /* 11: start_with & 12: end_with  */
});
const customEval = (str) => {
    try {
        /* eslint-disable-next-line no-new-func */
        return new Function(`'use strict'; const TRUE = true; const FALSE = false; const AND='&&'; return ${str};`)();
    } catch (error) {
        return false;
    }
};
const alter_eval = (obj, param) => {
    try {
        let final = "";
        if (param) {
            let temp = obj;
            const paramArr = array_filter(param.split("@$@"));
            const paramArrLen = paramArr.length;
            let i = 0;
            for (; i < paramArrLen; i++) {
                /* trim unnecessary values */
                const test = paramArr[i];
                if (typeof temp[test] == "undefined" || temp[test] == null) {
                    /* need to make final as null */
                    break;
                } else {
                    temp = temp[test];
                    final = temp;
                }
            }
        }
        return final;
    } catch (error) {
        return false;
    }
};
const checkValues = (obj) => typeof obj != 'undefined' && obj != '' && obj != null;
const lower_case_bool = (str) => {
    if (typeof str != "undefined" && str != null && str != "" && !isNaN(str)) {
        return Number(str);
    } else if (str != "" && typeof str == "boolean") {
        return str;
    } else {
        return (str) ? str.toLowerCase() : "";
    }
};
const htmlSpecialChars = (string = '', quoteStyle = 2, charset = 'UTF-8', doubleEncode = true) => {
    string = string || '';
    string = string.toString();
    if (doubleEncode) {
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (typeof quoteStyle !== 'number') {
        quoteStyle = OPTS[quoteStyle];
    }
    if (quoteStyle && OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
    }
    if (!(quoteStyle == 0)) {
        string = string.replace(/"/g, '&quot;');
    }
    if (charset == 'UTF-8') {
        return Buffer.from(string, 'utf-8').toString();
    } else {
        return string;
    }
};

function stripos(fHaystack, fNeedle, fOffset) {
    const haystack = (fHaystack + '').toLowerCase();
    const needle = (fNeedle + '').toLowerCase();
    return (haystack.indexOf(needle, fOffset)) !== -1;
}

function in_range(number, min, max) {
    number = Number(number.toString().trim());
    min = Number(min.toString().trim());
    max = Number(max.toString().trim());
    return number >= min && number <= max;
}
const every_val_check = (arr1, arr2) => {
    return arr1.every(i => arr2.includes(i));
}
const max_arr = (arr, key) => {
    return arr.reduce((max, obj) => (Number(max[key]) > Number(obj[key])) ? max : obj);
}
const min_arr = (arr, key) => {
    return arr.reduce((max, obj) => (Number(max[key]) < Number(obj[key])) ? max : obj);
}
module.exports = {
    mysql_real_escape_string,
    array_column,
    trim,
    date_format,
    replace_str_arr,
    timezone_date,
    in_array,
    isRealValue,
    error_log_message,
    array_intersect,
    replace_chr_arr,
    str_replace,
    html_entity_decode,
    array_filter,
    generateRandomString,
    day_diff,
    get_sql_range_str,
    base64Encode,
    base64Decode,
    funnel_valid_check,
    trigger_condition_define,
    customEval,
    alter_eval,
    checkValues,
    lower_case_bool,
    stripos,
    in_range,
    htmlSpecialChars,
    unique,
    every_val_check,
    max_arr,
    min_arr,
    date_array_bet,
    get_dynamic_chart_js_variable
}