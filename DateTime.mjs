


export default class DateTime extends Date
{
    #timezone;

    constructor(dateString,timezone)
    {
        if ( typeof dateString === 'string' || typeof dateString === 'number') {
            super(Date.parse(dateString));
        } else super();
        if ( typeof timezone === 'string' ) {
            this.setTimezone(timezone);
        }
    }

    toString()
    {   
        return this.format('Y-m-d') + 'T' + this.format('H:i:sO');
    }

    toJSON()
    {
        return this.toString();
    }

    format(format,timezone=null) {
        let defaults = {
            timeZone: this.#timezone
        };

        if ( typeof timezone == 'string' ) defaults.timeZone = timezone;
        

    
        let year   = this._format({year:'numeric'},defaults);
        let month  = this._format({month:'numeric'},defaults);
        let day    = this._format({day:'numeric'},defaults);
        let hour   = this._format({hour:'numeric'},defaults);
        let minute = this._format({minute:'numeric'},defaults);
        let second = this._format({second:'numeric'},defaults);

        return Array.from(format).map((char) => {
            switch (char) {
    
                // Day
                case 'd': return this._format({day:'2-digit'},defaults);
                case 'D': return this._format({weekday:'short'},defaults);
                case 'j': return day;
                case 'l': return this._format({weeday:'long'},defaults);
                // case 'N': return this.getDay() == 0 ? 7 : this.getDay(); // Not Timezone Safe
                case 'S': return this._dateSuffix(day);
                case 'w': return this.getDay(); // Not Timezone Safe
                case 'z': // Not Timezone Safe
                    var dtFirst = new Date(year, 0, 1, 0, 0, 0, 0);
                    var dtLast = new Date(year, this.getMonth(), this.getDate(), 0, 0, 0, 0);
                    return Math.round((dtLast.valueOf() - dtFirst.valueOf()) / 1000 / 60 / 60/ 24);
                
                // Week
                case 'W': // Not Timezone Safe
                    var dtTempFirst = this.firstMondayOfYear();
                    var dtTempLast = new Date(year, this.getMonth(), this.getDate());
                    return Math.ceil(Math.round((dtTempLast.valueOf() - dtTempFirst.valueOf()) / 1000 / 60 / 60/ 24) / 7);
    
                // Month
                case 'F': return this._format({month:'long'},defaults);
                case 'm': return this._format({month:'2-digit'},defaults);
                case 'M': return this._format({month:'short'},defaults);
                case 'n': return month;
                case 't': // Not Timezone Safe
                    var dtTemp = new Date(this.valueOf());
                    dtTemp.setMonth(dtTemp.getMonth() + 1)
                    dtTemp.setDate(0);
                    return dtTemp.getDate();
                
                // Year
                case 'L': return (new Date(year, 2, 0)).getDate() == 29 ? 1 : 0;
                case 'o': return (new Date(FirstMonday(year)) > date) ? (year - 1) : year;
                case 'X': 
                case 'x': return ''; // Not Implemented
                case 'Y': return year;
                case 'y': return this._format({year:'2-digit'},defaults);
                
                // Time - am/pm
                case 'a': return this.ampm(); // Not Timezone Safe
                case 'A': return this.ampm().toUpperCase(); // Not Timezone Safe
    
                // Hours
                case 'g': return hour;
                case 'G': return this._format({hour12:false,hour:'numeric'},defaults);
                case 'h': return this._format({hour:'2-digit'},defaults);
                case 'H': return this._format({hour12:false,hour:'2-digit',hourCycle:'h23'},defaults);
    
                // Minutes
                // Note Minute 2-digit does not work correctly standalone minute value
                case 'i': return this._format({hour12:false,minute:'2-digit',hourCycle:'h23'},defaults).padStart(2,'0');
    
                // Seconds
                // Note Second 2-digit does not work correctly standalone second value
                case 's': return this._format({second:'2-digit',hour12:false,hourCycle:'h23'},defaults).padStart(2,'0');
    
                // Microseconds
                case 'v': // Not Implemented
                
                // Milliseconds
                case 'u': return this.getMilliseconds();
    
                // Timezone
                case 'e': return this._format({timeZoneName:'long'},defaults).split(', ').pop(); // e.g Australian Eastern Daylight Time
                case 'I': // Daylight Savings
                    var dtTempFirst = new Date(year, 0, 1);
                    var dtTempLast = new Date(year, month,day);
                    var iDaysDiff = (dtTempLast.valueOf() - dtTempFirst.valueOf()) / 1000 / 60 / 60 / 24;
                    return iDaysDiff == Math.round(iDaysDiff) ? 0 : 1;
                case 'O': // +0800
                    return this._formatTimzeoneOffset(defaults);
                    
                case 'P': 
                    let pTemp = this._format({timeZoneName:'short'},defaults).split(', ').pop();
                    console.log(pTemp);
                    if (pTemp.indexOf('-') > -1) {
                        let aTemp = pTemp.substring(pTemp.indexOf('-') + 1).split('');
                        console.log(aTemp);
                        return ('-' + aTemp[0] + (aTemp[1] ?? '00') + ':' + aTemp[2] + aTemp[3]);
                    }
                    
                    if (pTemp.indexOf('+') > -1) {
                        var aTemp = pTemp.substring(pTemp.indexOf("+") + 1).split("");
                        console.log(aTemp);
                        if ( aTemp.length == 1 ) {
                            return ("+" + aTemp[0].padStart(2,'0') + ":00");
                        }
                        return ("+" + (aTemp[0] ?? '0') + (aTemp[1] ?? '0') + ":" + (aTemp[2] ?? '0') + (aTemp[3] ?? '0'));
                    }
                    return '+00:00';
                case 'p':
                    return '';
                case 'T': return this._format({timeZoneName:'short'},defaults).split(', ').pop();
                case 'Z': return this.getTimezoneOffset() < 0 ? Math.abs(this.getTimezoneOffset() * 60) : 0 - (this.getTimezoneOffset() * 60);
    
                // Full Date/Time
                case 'c': // ISO 8601 date
                    return year + '-' +
                           this._format({month:'2-digit'},defaults) + '-' +
                           this._format({day:'2-digit'},defaults) + 'T' +
                           this._format({hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'},defaults) + 
                           this._formatTimzeoneOffset(defaults);
                case 'r':
                    return this._format({weekday:'short'},defaults) + ', ' +
                           this._format({day:'numeric'},defaults) + ' ' +
                           this._format({month:'short'},defaults) + ' ' +
                           year + ' ' + 
                           this._format({hour12:false,hour:'2-digit',hourCycle:'h23'},defaults) + ':' +
                           this._format({minute:'2-digit'},defaults) + ':' +
                           this._format({second:'2-digit'},defaults);
                case 'U': return Math.floor( new Date(year,month,day,hour,minute,second).getTime() / 1000 );
    
                default: // Pass through Other Characters
                    return char;
            }
        }).join('');
    }
    

    _toTimezoneOffset()
    {
        const offset = -this.getTimezoneOffset();

        const hours = Math.floor(offset/60);
        const minutes = offset - (hours*60);

        return `${offset < 0?'-':'+'}${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
    }

    _format (options,defaults) {
        return new Intl.DateTimeFormat('en',Object.assign(options,defaults)).format(this);
    };
    
    _padd(value) {
        return value < 10 ? ('0' + value) : value;
    };

    setTimezone(timezone)
    {
        this.#timezone = timezone;
    }

    getTimezone()
    {
        return this.#timezone;
    }

    _dateSuffix(day)
    {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }


    _formatTimzeoneOffset(defaults,seperator=':')
    {
        let pTemp = this._format({timeZoneName:'short'},defaults).split(', ').pop();
        if (pTemp.indexOf('-') > -1) {
            let aTemp = pTemp.substring(pTemp.indexOf('-') + 1).split('');
            return ('-' + aTemp[0] + (aTemp[1] ?? '00') + aTemp[2] + aTemp[3]);
        }
        
        if (pTemp.indexOf('+') > -1) {
            var aTemp = pTemp.substring(pTemp.indexOf("+") + 1).split("");
            if ( aTemp.length == 1 ) {
                return (`+${aTemp[0].padStart(2,'0')}${seperator}00`);
            }
            return ("+" + (aTemp[0] ?? '0') + (aTemp[1] ?? '0') + seperator + (aTemp[2] ?? '0') + (aTemp[3] ?? '0'));
        }
        return `+00${seperator}00`;
    }
    
}