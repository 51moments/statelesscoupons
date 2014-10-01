var coupons = require('./');
var assert = require('assert');

assert.equal(coupons.parseCoupon('garbage'), null, 'Invalid coupons return null');

var expiredCoupon = coupons.makeCoupon(2014, 1, 1, 10, 99);
console.log('testing expired coupon: ' + expiredCoupon);
assert.equal(coupons.parseCoupon(expiredCoupon), null, 'Expired coupons return null');

var notYetValidCoupon = coupons.makeCoupon(2020, 1, 1, 10, 99);
console.log('testing not-yet-valid coupon: ' + notYetValidCoupon);
assert.equal(coupons.parseCoupon(notYetValidCoupon), null, 'Future coupons return null');

var now = new Date();
var validCoupon = coupons.makeCoupon(now.getYear() + 1900, now.getMonth() + 1, now.getDate(), 1, 50);
console.log('testing 1 day 50% off coupon: ' + validCoupon);
assert.equal(coupons.parseCoupon(validCoupon), 0.5, 'Coupon good for one day at 50% off returns 0.5');
