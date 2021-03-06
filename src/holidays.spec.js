import test from 'ava';
import {HolidayEvent, RoshChodeshEvent, MevarchimChodeshEvent} from './holidays';
import {HebrewCalendar} from './hebcal';
import {greg as g} from './greg';
import {HDate, months} from './hdate';
import {flags, Event} from './event';

test('basename-and-url', (t) => {
  const ev = new HolidayEvent(new HDate(18, months.NISAN, 5763),
      'Pesach IV (CH\'\'M)', flags.CHUL_ONLY, {cholHaMoedDay: 2});
  t.is(ev.getDesc(), 'Pesach IV (CH\'\'M)');
  t.is(ev.render(), 'Pesach IV (CH\'\'M)');
  t.is(ev.renderBrief(), 'Pesach IV (CH\'\'M)');
  t.is(ev.basename(), 'Pesach');
  t.is(ev.url(), 'https://www.hebcal.com/holidays/pesach-2003');

  const ev2 = new HolidayEvent(new HDate(23, months.TISHREI, 5763),
      'Simchat Torah', flags.CHUL_ONLY);
  t.is(ev2.getDesc(), 'Simchat Torah');
  t.is(ev2.render(), 'Simchat Torah');
  t.is(ev2.renderBrief(), 'Simchat Torah');
  t.is(ev2.basename(), 'Simchat Torah');
  t.is(ev2.url(), 'https://www.hebcal.com/holidays/simchat-torah-2002');

  const ev3 = new HolidayEvent(new HDate(8, months.AV, 5783),
      'Erev Tish\'a B\'Av', flags.MAJOR_FAST);
  t.is(ev3.getDesc(), 'Erev Tish\'a B\'Av');
  t.is(ev3.render(), 'Erev Tish\'a B\'Av');
  t.is(ev3.renderBrief(), 'Erev Tish\'a B\'Av');
  t.is(ev3.basename(), 'Tish\'a B\'Av');
  t.is(ev3.url(), 'https://www.hebcal.com/holidays/tisha-bav-2023');

  const rch = new RoshChodeshEvent(new HDate(30, months.ADAR_I, 5787), 'Adar II');
  t.is(rch.getDesc(), 'Rosh Chodesh Adar II');
  t.is(rch.render(), 'Rosh Chodesh Adar II');
  t.is(rch.renderBrief(), 'Rosh Chodesh Adar II');
  t.is(rch.basename(), 'Rosh Chodesh Adar II');
  t.is(rch.url(), 'https://www.hebcal.com/holidays/rosh-chodesh-adar-ii-2027');

  const mvch = new MevarchimChodeshEvent(new HDate(23, months.KISLEV, 5769), 'Tevet');
  t.is(mvch.getDesc(), 'Shabbat Mevarchim Chodesh Tevet');
  t.is(mvch.render(), 'Shabbat Mevarchim Chodesh Tevet');
  t.is(mvch.renderBrief(), 'Shabbat Mevarchim Chodesh Tevet');
  t.is(mvch.url(), undefined);
});

test('MevarchimChodeshEvent', (t) => {
  const mvch = new MevarchimChodeshEvent(new HDate(23, months.KISLEV, 5769), 'Tevet');
  t.is(mvch.memo, 'Molad Tevet: Sat, 10 minutes and 16 chalakim after 16:00');
});

test('shushan-purim', (t) => {
  const events = HebrewCalendar.calendar({year: 2015, numYears: 15});
  const shushan = events.filter((ev) => ev.getDesc() == 'Shushan Purim');
  const dates = shushan.map((ev) => ev.getDate().toString());
  const expected = [
    '15 Adar 5775',
    '15 Adar II 5776',
    '15 Adar 5777',
    '15 Adar 5778',
    '15 Adar II 5779',
    '15 Adar 5780',
    '16 Adar 5781',
    '15 Adar II 5782',
    '15 Adar 5783',
    '15 Adar II 5784',
    '16 Adar 5785',
    '15 Adar 5786',
    '15 Adar II 5787',
    '15 Adar 5788',
    '15 Adar 5789',
  ];
  t.deepEqual(dates, expected, '15 years of Shushan Purim differ');
});

test('getHolidaysOnDate', (t) => {
  const hyear = 5771;
  const expected = [
    new HDate(1, 'Tishrei', hyear).abs() - 1, ['Erev Rosh Hashana'],
    new HDate(1, 'Tishrei', hyear), ['Rosh Hashana 5771'],
    new HDate(10, 'Tishrei', hyear), ['Yom Kippur'],
    new HDate(3, 'Cheshvan', hyear), undefined,
    new Date(2010, 11, 7), ['Chanukah: 7 Candles', 'Rosh Chodesh Tevet'],
  ];
  for (let i = 0; i < expected.length; i += 2) {
    const dt = expected[i];
    const desc = expected[i + 1];
    const ev = HebrewCalendar.getHolidaysOnDate(dt);
    if (typeof desc === 'undefined') {
      t.is(ev, undefined, dt.toString());
    } else {
      t.is(Array.isArray(ev), true);
      t.is(ev[0] instanceof Event, true);
      const d = ev.map((e) => e.getDesc());
      t.deepEqual(d, desc, dt.toString());
    }
  }
});

test('getHolidaysOnDate-il', (t) => {
  const dtShavuot1 = new Date(2021, 4, 17);
  const dtShavuot2 = new Date(2021, 4, 18);
  const events0 = HebrewCalendar.getHolidaysOnDate(dtShavuot1);
  t.is(events0.length, 2);

  const events1il = HebrewCalendar.getHolidaysOnDate(dtShavuot1, true);
  t.is(events1il.length, 1);
  t.is(events1il[0].getDesc(), 'Shavuot');

  const events1diaspora = HebrewCalendar.getHolidaysOnDate(dtShavuot1, false);
  t.is(events1diaspora.length, 1);
  t.is(events1diaspora[0].getDesc(), 'Shavuot I');

  const events2d = HebrewCalendar.getHolidaysOnDate(dtShavuot2, false);
  t.is(events2d.length, 1);
  t.is(events2d[0].getDesc(), 'Shavuot II');

  const events2il = HebrewCalendar.getHolidaysOnDate(dtShavuot2, true);
  t.is(events2il.length, 0, 'expected no Shavuot II in Israel');
});

test('getHolidaysForYearArray-5771-diaspora', (t) => {
  const events = HebrewCalendar.getHolidaysForYearArray(5771, false).map(eventDateDesc);
  const expected = [
    {date: '2010-09-09', desc: 'Rosh Hashana 5771'},
    {date: '2010-09-10', desc: 'Rosh Hashana II'},
    {date: '2010-09-11', desc: 'Shabbat Shuva'},
    {date: '2010-09-12', desc: 'Tzom Gedaliah'},
    {date: '2010-09-17', desc: 'Erev Yom Kippur'},
    {date: '2010-09-18', desc: 'Yom Kippur'},
    {date: '2010-09-22', desc: 'Erev Sukkot'},
    {date: '2010-09-23', desc: 'Sukkot I'},
    {date: '2010-09-24', desc: 'Sukkot II'},
    {date: '2010-09-25', desc: 'Sukkot III (CH\'\'M)'},
    {date: '2010-09-26', desc: 'Sukkot IV (CH\'\'M)'},
    {date: '2010-09-27', desc: 'Sukkot V (CH\'\'M)'},
    {date: '2010-09-28', desc: 'Sukkot VI (CH\'\'M)'},
    {date: '2010-09-29', desc: 'Sukkot VII (Hoshana Raba)'},
    {date: '2010-09-30', desc: 'Shmini Atzeret'},
    {date: '2010-10-01', desc: 'Simchat Torah'},
    {date: '2010-10-02', desc: 'Shabbat Mevarchim Chodesh Cheshvan'},
    {date: '2010-10-08', desc: 'Rosh Chodesh Cheshvan'},
    {date: '2010-10-09', desc: 'Rosh Chodesh Cheshvan'},
    {date: '2010-11-06', desc: 'Sigd'},
    {date: '2010-11-06', desc: 'Shabbat Mevarchim Chodesh Kislev'},
    {date: '2010-11-07', desc: 'Rosh Chodesh Kislev'},
    {date: '2010-11-08', desc: 'Rosh Chodesh Kislev'},
    {date: '2010-12-01', desc: 'Chanukah: 1 Candle'},
    {date: '2010-12-02', desc: 'Chanukah: 2 Candles'},
    {date: '2010-12-03', desc: 'Chanukah: 3 Candles'},
    {date: '2010-12-04', desc: 'Chanukah: 4 Candles'},
    {date: '2010-12-04', desc: 'Shabbat Mevarchim Chodesh Tevet'},
    {date: '2010-12-05', desc: 'Chanukah: 5 Candles'},
    {date: '2010-12-06', desc: 'Chanukah: 6 Candles'},
    {date: '2010-12-07', desc: 'Chanukah: 7 Candles'},
    {date: '2010-12-07', desc: 'Rosh Chodesh Tevet'},
    {date: '2010-12-08', desc: 'Chanukah: 8 Candles'},
    {date: '2010-12-08', desc: 'Rosh Chodesh Tevet'},
    {date: '2010-12-09', desc: 'Chanukah: 8th Day'},
    {date: '2010-12-17', desc: 'Asara B\'Tevet'},
    {date: '2011-01-01', desc: 'Shabbat Mevarchim Chodesh Sh\'vat'},
    {date: '2011-01-06', desc: 'Rosh Chodesh Sh\'vat'},
    {date: '2011-01-15', desc: 'Shabbat Shirah'},
    {date: '2011-01-20', desc: 'Tu BiShvat'},
    {date: '2011-01-29', desc: 'Shabbat Mevarchim Chodesh Adar I'},
    {date: '2011-02-04', desc: 'Rosh Chodesh Adar I'},
    {date: '2011-02-05', desc: 'Rosh Chodesh Adar I'},
    {date: '2011-02-18', desc: 'Purim Katan'},
    {date: '2011-03-05', desc: 'Shabbat Shekalim'},
    {date: '2011-03-05', desc: 'Shabbat Mevarchim Chodesh Adar II'},
    {date: '2011-03-06', desc: 'Rosh Chodesh Adar II'},
    {date: '2011-03-07', desc: 'Rosh Chodesh Adar II'},
    {date: '2011-03-17', desc: 'Ta\'anit Esther'},
    {date: '2011-03-19', desc: 'Shabbat Zachor'},
    {date: '2011-03-19', desc: 'Erev Purim'},
    {date: '2011-03-20', desc: 'Purim'},
    {date: '2011-03-21', desc: 'Shushan Purim'},
    {date: '2011-03-26', desc: 'Shabbat Parah'},
    {date: '2011-04-02', desc: 'Shabbat HaChodesh'},
    {date: '2011-04-02', desc: 'Shabbat Mevarchim Chodesh Nisan'},
    {date: '2011-04-05', desc: 'Rosh Chodesh Nisan'},
    {date: '2011-04-16', desc: 'Shabbat HaGadol'},
    {date: '2011-04-18', desc: 'Ta\'anit Bechorot'},
    {date: '2011-04-18', desc: 'Erev Pesach'},
    {date: '2011-04-19', desc: 'Pesach I'},
    {date: '2011-04-20', desc: 'Pesach II'},
    {date: '2011-04-21', desc: 'Pesach III (CH\'\'M)'},
    {date: '2011-04-22', desc: 'Pesach IV (CH\'\'M)'},
    {date: '2011-04-23', desc: 'Pesach V (CH\'\'M)'},
    {date: '2011-04-24', desc: 'Pesach VI (CH\'\'M)'},
    {date: '2011-04-25', desc: 'Pesach VII'},
    {date: '2011-04-26', desc: 'Pesach VIII'},
    {date: '2011-04-30', desc: 'Shabbat Mevarchim Chodesh Iyyar'},
    {date: '2011-05-02', desc: 'Yom HaShoah'},
    {date: '2011-05-04', desc: 'Rosh Chodesh Iyyar'},
    {date: '2011-05-05', desc: 'Rosh Chodesh Iyyar'},
    {date: '2011-05-09', desc: 'Yom HaZikaron'},
    {date: '2011-05-10', desc: 'Yom HaAtzma\'ut'},
    {date: '2011-05-18', desc: 'Pesach Sheni'},
    {date: '2011-05-22', desc: 'Lag BaOmer'},
    {date: '2011-05-28', desc: 'Shabbat Mevarchim Chodesh Sivan'},
    {date: '2011-06-01', desc: 'Yom Yerushalayim'},
    {date: '2011-06-03', desc: 'Rosh Chodesh Sivan'},
    {date: '2011-06-07', desc: 'Erev Shavuot'},
    {date: '2011-06-08', desc: 'Shavuot I'},
    {date: '2011-06-09', desc: 'Shavuot II'},
    {date: '2011-06-25', desc: 'Shabbat Mevarchim Chodesh Tamuz'},
    {date: '2011-07-02', desc: 'Rosh Chodesh Tamuz'},
    {date: '2011-07-03', desc: 'Rosh Chodesh Tamuz'},
    {date: '2011-07-19', desc: 'Tzom Tammuz'},
    {date: '2011-07-30', desc: 'Shabbat Mevarchim Chodesh Av'},
    {date: '2011-08-01', desc: 'Rosh Chodesh Av'},
    {date: '2011-08-06', desc: 'Shabbat Chazon'},
    {date: '2011-08-08', desc: 'Erev Tish\'a B\'Av'},
    {date: '2011-08-09', desc: 'Tish\'a B\'Av'},
    {date: '2011-08-13', desc: 'Shabbat Nachamu'},
    {date: '2011-08-15', desc: 'Tu B\'Av'},
    {date: '2011-08-27', desc: 'Shabbat Mevarchim Chodesh Elul'},
    {date: '2011-08-30', desc: 'Rosh Chodesh Elul'},
    {date: '2011-08-31', desc: 'Rosh Chodesh Elul'},
    {date: '2011-09-24', desc: 'Leil Selichot'},
    {date: '2011-09-28', desc: 'Erev Rosh Hashana'},
  ];
  t.deepEqual(events, expected);
});

test('getHolidaysForYearArray-5720-il', (t) => {
  const events = HebrewCalendar.getHolidaysForYearArray(5720, true).map(eventDateDesc);
  const expected = [
    {date: '1959-10-03', desc: 'Rosh Hashana 5720'},
    {date: '1959-10-04', desc: 'Rosh Hashana II'},
    {date: '1959-10-05', desc: 'Tzom Gedaliah'},
    {date: '1959-10-10', desc: 'Shabbat Shuva'},
    {date: '1959-10-11', desc: 'Erev Yom Kippur'},
    {date: '1959-10-12', desc: 'Yom Kippur'},
    {date: '1959-10-16', desc: 'Erev Sukkot'},
    {date: '1959-10-17', desc: 'Sukkot I'},
    {date: '1959-10-18', desc: 'Sukkot II (CH\'\'M)'},
    {date: '1959-10-19', desc: 'Sukkot III (CH\'\'M)'},
    {date: '1959-10-20', desc: 'Sukkot IV (CH\'\'M)'},
    {date: '1959-10-21', desc: 'Sukkot V (CH\'\'M)'},
    {date: '1959-10-22', desc: 'Sukkot VI (CH\'\'M)'},
    {date: '1959-10-23', desc: 'Sukkot VII (Hoshana Raba)'},
    {date: '1959-10-24', desc: 'Shmini Atzeret'},
    {date: '1959-10-31', desc: 'Shabbat Mevarchim Chodesh Cheshvan'},
    {date: '1959-11-01', desc: 'Rosh Chodesh Cheshvan'},
    {date: '1959-11-02', desc: 'Rosh Chodesh Cheshvan'},
    {date: '1959-11-28', desc: 'Shabbat Mevarchim Chodesh Kislev'},
    {date: '1959-12-01', desc: 'Rosh Chodesh Kislev'},
    {date: '1959-12-02', desc: 'Rosh Chodesh Kislev'},
    {date: '1959-12-25', desc: 'Chanukah: 1 Candle'},
    {date: '1959-12-26', desc: 'Chanukah: 2 Candles'},
    {date: '1959-12-26', desc: 'Shabbat Mevarchim Chodesh Tevet'},
    {date: '1959-12-27', desc: 'Chanukah: 3 Candles'},
    {date: '1959-12-28', desc: 'Chanukah: 4 Candles'},
    {date: '1959-12-29', desc: 'Chanukah: 5 Candles'},
    {date: '1959-12-30', desc: 'Chanukah: 6 Candles'},
    {date: '1959-12-31', desc: 'Chanukah: 7 Candles'},
    {date: '1959-12-31', desc: 'Rosh Chodesh Tevet'},
    {date: '1960-01-01', desc: 'Chanukah: 8 Candles'},
    {date: '1960-01-01', desc: 'Rosh Chodesh Tevet'},
    {date: '1960-01-02', desc: 'Chanukah: 8th Day'},
    {date: '1960-01-10', desc: 'Asara B\'Tevet'},
    {date: '1960-01-23', desc: 'Shabbat Mevarchim Chodesh Sh\'vat'},
    {date: '1960-01-30', desc: 'Rosh Chodesh Sh\'vat'},
    {date: '1960-02-13', desc: 'Tu BiShvat'},
    {date: '1960-02-13', desc: 'Shabbat Shirah'},
    {date: '1960-02-27', desc: 'Shabbat Shekalim'},
    {date: '1960-02-27', desc: 'Shabbat Mevarchim Chodesh Adar'},
    {date: '1960-02-28', desc: 'Rosh Chodesh Adar'},
    {date: '1960-02-29', desc: 'Rosh Chodesh Adar'},
    {date: '1960-03-10', desc: 'Ta\'anit Esther'},
    {date: '1960-03-12', desc: 'Shabbat Zachor'},
    {date: '1960-03-12', desc: 'Erev Purim'},
    {date: '1960-03-13', desc: 'Purim'},
    {date: '1960-03-14', desc: 'Shushan Purim'},
    {date: '1960-03-19', desc: 'Shabbat Parah'},
    {date: '1960-03-26', desc: 'Shabbat HaChodesh'},
    {date: '1960-03-26', desc: 'Shabbat Mevarchim Chodesh Nisan'},
    {date: '1960-03-29', desc: 'Rosh Chodesh Nisan'},
    {date: '1960-04-09', desc: 'Shabbat HaGadol'},
    {date: '1960-04-11', desc: 'Ta\'anit Bechorot'},
    {date: '1960-04-11', desc: 'Erev Pesach'},
    {date: '1960-04-12', desc: 'Pesach I'},
    {date: '1960-04-13', desc: 'Pesach II (CH\'\'M)'},
    {date: '1960-04-14', desc: 'Pesach III (CH\'\'M)'},
    {date: '1960-04-15', desc: 'Pesach IV (CH\'\'M)'},
    {date: '1960-04-16', desc: 'Pesach V (CH\'\'M)'},
    {date: '1960-04-17', desc: 'Pesach VI (CH\'\'M)'},
    {date: '1960-04-18', desc: 'Pesach VII'},
    {date: '1960-04-23', desc: 'Shabbat Mevarchim Chodesh Iyyar'},
    {date: '1960-04-25', desc: 'Yom HaShoah'},
    {date: '1960-04-27', desc: 'Rosh Chodesh Iyyar'},
    {date: '1960-04-28', desc: 'Rosh Chodesh Iyyar'},
    {date: '1960-05-01', desc: 'Yom HaZikaron'},
    {date: '1960-05-02', desc: 'Yom HaAtzma\'ut'},
    {date: '1960-05-11', desc: 'Pesach Sheni'},
    {date: '1960-05-15', desc: 'Lag BaOmer'},
    {date: '1960-05-21', desc: 'Shabbat Mevarchim Chodesh Sivan'},
    {date: '1960-05-27', desc: 'Rosh Chodesh Sivan'},
    {date: '1960-05-31', desc: 'Erev Shavuot'},
    {date: '1960-06-01', desc: 'Shavuot'},
    {date: '1960-06-18', desc: 'Shabbat Mevarchim Chodesh Tamuz'},
    {date: '1960-06-25', desc: 'Rosh Chodesh Tamuz'},
    {date: '1960-06-26', desc: 'Rosh Chodesh Tamuz'},
    {date: '1960-07-12', desc: 'Tzom Tammuz'},
    {date: '1960-07-23', desc: 'Shabbat Mevarchim Chodesh Av'},
    {date: '1960-07-25', desc: 'Rosh Chodesh Av'},
    {date: '1960-07-30', desc: 'Shabbat Chazon'},
    {date: '1960-08-01', desc: 'Erev Tish\'a B\'Av'},
    {date: '1960-08-02', desc: 'Tish\'a B\'Av'},
    {date: '1960-08-06', desc: 'Shabbat Nachamu'},
    {date: '1960-08-08', desc: 'Tu B\'Av'},
    {date: '1960-08-20', desc: 'Shabbat Mevarchim Chodesh Elul'},
    {date: '1960-08-23', desc: 'Rosh Chodesh Elul'},
    {date: '1960-08-24', desc: 'Rosh Chodesh Elul'},
    {date: '1960-09-17', desc: 'Leil Selichot'},
    {date: '1960-09-21', desc: 'Erev Rosh Hashana'},
  ];
  t.deepEqual(events, expected);
});

// eslint-disable-next-line require-jsdoc
function eventDateBasenameDesc(ev) {
  return {
    date: ev.getDate().greg().toISOString().substring(0, 10),
    basename: ev.basename(),
    desc: ev.getDesc(),
  };
}

// eslint-disable-next-line require-jsdoc
function eventDateDesc(ev) {
  return {
    date: ev.getDate().greg().toISOString().substring(0, 10),
    desc: ev.getDesc(),
  };
}

test('9av-observed', (t) => {
  const events = HebrewCalendar.calendar({year: 2015, numYears: 10});
  const av9 = events.filter((ev) => ev.getDesc().substring(0, 11) === 'Tish\'a B\'Av');
  const actual = av9.map(eventDateBasenameDesc);
  const expected = [
    {date: '2015-07-26', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av (observed)'},
    {date: '2016-08-14', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av (observed)'},
    {date: '2017-08-01', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av'},
    {date: '2018-07-22', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av (observed)'},
    {date: '2019-08-11', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av (observed)'},
    {date: '2020-07-30', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av'},
    {date: '2021-07-18', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av'},
    {date: '2022-08-07', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av (observed)'},
    {date: '2023-07-27', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av'},
    {date: '2024-08-13', basename: 'Tish\'a B\'Av', desc: 'Tish\'a B\'Av'},
  ];
  t.deepEqual(actual, expected);
  t.is(av9[0].render('he'), 'תִּשְׁעָה בְּאָב נִדחֶה');
  t.is(av9[2].render('he'), 'תִּשְׁעָה בְּאָב');
});

test('asara-btevet-url', (t) => {
  const urls = HebrewCalendar.calendar({year: 2020})
      .filter((ev) => ev.getDesc() === 'Asara B\'Tevet')
      .map((ev) => ev.url());
  const expected = [
    'https://www.hebcal.com/holidays/asara-btevet-20200107',
    'https://www.hebcal.com/holidays/asara-btevet-20201225',
  ];
  t.deepEqual(urls, expected);
});
