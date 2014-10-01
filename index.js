var crypto = require('crypto');

function mkCouponNoHash(year, month, date, days, pct) {
  // construct a base-10 string like MMDDZZPP then convert it to base 36
  // Notes:
  //   MM = months since January 2014, e.g. 1 = Jan 2014, 13 = Jan 2015
  //   DD = date
  //   ZZ = duration in days
  //   PP = discount, goes from 1% to 100% (0..99)

  var months = (year - 2014) * 12 + month;
  var datePad = '', daysPad = '', pctPad = '';
  if(date < 10)
    datePad = '0';

  if(days < 10)
    daysPad = '0';

  pct--;
  if(pct < 10)
    pctPad = '0';

  return Number(months + datePad + Number(date) + daysPad + Number(days) + pctPad + Number(pct)).toString(36).toUpperCase();
}

// Replace this function to include your own custom 1-character checksum to
// increase the difficulty of reverse-engineering your coupons.
function checksum(what) {
  return crypto.createHash('md5').update(what).digest('hex').toUpperCase().substring(0, 1);
}

// e.g. makeCoupon(2014, 10, 1, 14, 25) => produces a coupon that's good for 25%
// off for the 2 weeks starting October 1
function makeCoupon(year, month, date, days, pct) {
  var noHash = mkCouponNoHash(year, month, date, days, pct);

  return noHash + checksum(noHash);
}

// The inverse of makeCoupon. Given a coupon code, returns:
//   null if coupon invalid, expired, or not yet valid
//   a float between 0.01 and 1.00, expressing the percentage discount that is offered
function parseCoupon(couponName) {
  couponName = (couponName || '').toUpperCase().replace(' ', '');

  // Is it a base-36 string?
  var codedCouponRe = /^([0-9A-Z]+)([0-9A-Z]{1})$/;
  var rv = codedCouponRe.exec(couponName);

  if(!rv)
    return null;

  var base36 = rv[1];
  var hash = rv[2];

  var originalNumber = parseInt(base36, 36);

  var re = /^([0-9]{1,2})([0-9]{2})([0-9]{2})([0-9]{2})$/;
  rv = re.exec(originalNumber);
  if(!rv)
    return null;

  var year = 2014 + Math.floor(Number(rv[1]) / 12);
  var month = Number(rv[1]) % 12;
  var date = Number(rv[2]);
  var days = Number(rv[3]);
  var percent = Number(rv[4]) + 1;

  // Is the hash valid?
  if(couponName != exports.makeCoupon(year, month, date, days, percent))
    return null;

  // Is the coupon still in the validity window?
  var start = new Date(year, month - 1, date, 0, 0, 0);
  var now = new Date();

  if(now.getTime() > start.getTime() && start.getTime() + days * 86400 * 1000 > now.getTime())
    return percent / 100;

  return null;
}

module.exports.makeCoupon = makeCoupon;
module.exports.parseCoupon = parseCoupon;
