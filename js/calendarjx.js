/**
@AUTHOR JONNAS SCHLOTTFELDT
@DATE 2019-06-19
@REQUIRIMENTS jquery-3.3.1.slim.min.js,bootstrap-4.3.1,momentjs-2.24.0
@FEATURES An appointment can be made for the current day or future date,
no two appointments should overlap. if an Appointment alrady exists for a day, a warning should be shown.
appointments can be edited and deleted.

@COMMENTS Tested on FIREFOX QUANTUM 67.0.1 (64-bits) only. (sorry)
There are a lot of refactory to do , and failsafe testing but I've spent enough time with this litle app, it's time to move on.
maybe a reliable version will be availble in my github soon.
ps: I made this with litle time a day and in a hurry.
**/
//---------------Global Vars
var dayClicked = 0; //refer to the string on the top left corner of the day div
var currentDate; //current date
var calendarElement; //refer to the calendarElement
var lastEventElement; //Keep the last clicked eventbar element saved for futher use.
var currentMonthStr; //as the name says current month in string
var appointments = []; //the appointments of the app
var dayElement; //Day element saved after the user click on it.
var lastEventName; //As the name says last Event Name for reference.
//---------------END-Global Vars

//Check if the dates overlap each other
function isOverlap(timeA, timeB) {
  datetimeC = moment(timeA);
  datetimeD = moment(timeB);
  var flag = false;
  for (let key in appointments) {
    datetimeA = moment(appointments[key].event_date + " " + appointments[key].event_timeFrom);
    datetimeB = moment(appointments[key].event_date + " " + appointments[key].event_timeTo);
    //Is overlpping ?
    if ((datetimeC >= datetimeA && datetimeC <= datetimeB) || (datetimeD >= datetimeA) && (datetimeD <= datetimeB)) {
      flag = true;
    }
  }
  return flag;
}

//Draw The callendar without need to paste the html in the page
function drawCalendar(container) {
  html = '<div class="calendarXHeader"> ' +
    '    <a href="#" class="previous round">' +
    '      <</a> <a href="#" class="forward round">>' +
    '    </a>' +
    '<a href="#" class="today">today</a>' +
    '  <div class="month"></div>' +
    '</div>' +
    '<div class="calendarXLowerHeader">' +
    '  <ul class="weekdays">' +
    '    <li>Sun</li>' +
    '    <li>Mon</li>' +
    '    <li>Tue</li>' +
    '    <li>Wed</li>' +
    '    <li>Thu</li>' +
    '    <li>Fri</li>' +
    '    <li>Sat</li>' +
    '  </ul>' +
    '</div>' +
    '<div class="calendarXBody"></div>' +
    '<div class="calendarXFooter"></div>';
  $(container).append(html);
  calendarElement = container;
}
//Redraw the calendar each time you change month
function redrawCalendar() {
  $(calendarElement).html('');
  drawCalendar(calendarElement);
  currentDate = moment();
  createDaysCanvas(currentDate); //create day's canvas
}

//Print header info
function assembleHeader() {
  currentDate = moment().format();
}

//DRAW THE CALENDAR!
function createDaysCanvas(datex) {
  var totalDays = moment(datex).daysInMonth();
  var dayofweek = moment(datex).startOf('month').day();
  var dow = dayofweek != 0 ? dayofweek : 7; //sunday is 0 ? ok change it to 7
  var monthSelected = moment(datex).format('MMMM YYYY');
  var monthSelected_short = moment(datex).format('MM');
  $('.month').html("");
  $('.month').append(monthSelected);
  //create the squares of the last past month until the first day of current month
  if (dow < 7) {
    for (let i = 0; i < dow; i++) {
      if (i == 0 || i == 6) { // if it's weekend
        $('.calendarXBody').append("<div class='days weekend'></div>");
      } else {
        $('.calendarXBody').append("<div class='days'></div>");
      }
    }
  }
  //DRAW THE WHOLE MONTH
  for (let day = 1; day <= totalDays; day++) {
    var cntEventsSameDay = 0;
    var eventbar_html = "";
    var formatx = day < 10 ? "YYYY-MM-0" + day : "YYYY-MM-" + day; //hack to add 0 in front of string
    var dateAux = moment(datex).format(formatx);
    //READ EVENTS FROM ARRAY AND DRAW THE EVENT BARS INTO DIV DAY
    for (let key in appointments) {
      if (appointments[key].event_date == dateAux) {
        if (cntEventsSameDay > 1) {
          eventbar_html += "<div class='moreEvents'><a href='#' class='link-more'>more</a></div>";
        } else {
          eventbar_html += "<div class='eventbar' data-toggle='modal' data-target='#ModalUpdate'>" + appointments[key].event_title + "</div>";
          cntEventsSameDay++;
        }
      }
    }
    if (dow == 6 || dow == 0 || dow == 7) { //if weekend true
      if (moment(currentDate).format('D') == day && currentMonthStr == monthSelected) {
        $('.calendarXBody').append("<div class='days currentDay' data-toggle='modal' data-target='#createModal'>" + day + eventbar_html + "</div>"); //weekend current day
      } else {
        $('.calendarXBody').append("<div class='days weekend' data-toggle='modal' data-target='#createModal'>" + day + eventbar_html + "</div>"); //weekends
      }
    } else if (moment(currentDate).format('D') == day && currentMonthStr == monthSelected) {
      $('.calendarXBody').append("<div class='days currentDay' data-toggle='modal' data-target='#createModal'>" + day + eventbar_html + "</div>"); //currentday
    } else {
      $('.calendarXBody').append("<div class='days' data-toggle='modal' data-target='#createModal'>" + day + eventbar_html + "</div>");
    }
    dow = moment(datex).startOf('month').add(day, 'days').day();
  }
} //end function


//Validation CREATE MODAL
function isCreateModalValidated() {
  var validated = false;
  var listErrors = [];
  if ($('#txtTitle').val() == "") {
    listErrors.push("Title is empty.");
  }
  if ($('#txtTimeA').val() == "" || $('#txtTimeA').val().length < 5) {
    listErrors.push("Event From: is empty or wrong format.");
  }
  if ($('#txtTimeB').val() == "" || $('#txtTimeB').val().length < 5) {
    listErrors.push("Event Until: is empty or wrong format.");
  }
  if ($('#txtNotes').val() == "") {
    listErrors.push("Notes is empty.");
  }
  if (listErrors.length > 0) {
    alert("Errors: \n\n" + listErrors.join("\n"));
    return false;
  } else {
    return true;
  }
}
//Validation UPDATE MODAL
function isUpdateModalValidated() {
  var validated = false;
  var listErrors = [];
  if ($('#utxtTitle').val() == "") {
    listErrors.push("Title is empty.");
  }
  if ($('#utxtTimeA').val() == "" || $('#utxtTimeA').val().length < 5) {
    listErrors.push("Event From: is empty or wrong format.");
  }
  if ($('#utxtTimeB').val() == "" || $('#utxtTimeB').val().length < 5) {
    listErrors.push("Event Until: is empty or wrong format.");
  }
  if ($('#utxtNotes').val() == "") {
    listErrors.push("Notes is empty.");
  }
  if (listErrors.length > 0) {
    alert("Errors: \n\n" + listErrors.join("\n"));
    return false;
  } else {
    return true;
  }
}
//CLEAN MODAL FIELDS
function cleanModalFields() {
  $('#txtTitle').val('');
  $('#txtTimeA').val('');
  $('#txtTimeB').val('');
  $('#txtNotes').val('');
  $('#utxtTitle').val('');
  $('#utxtTimeA').val('');
  $('#utxtTimeB').val('');
  $('#utxtNotes').val('');
}
//---------------------------CLICK---EVENTS-------------------------------------
function bindClick() {

  //CLICK SAVE EVENT!!
  $(document).on('click', "#btnSaveEvent", function() {
    dateSelected = moment(currentDate).format('YYYY-MM-' + dayClicked);
    var dateTimeFrom = moment(currentDate).format('YYYY-MM-' + dayClicked + " " + $("#txtTimeA").val());
    var dateTimeTo = moment(currentDate).format('YYYY-MM-' + dayClicked + " " + $("#txtTimeB").val());
    console.log(dateTimeFrom, " ", dateTimeTo);
    //Overlap routine to check two dates
    if (isOverlap(dateTimeFrom, dateTimeTo)) {
      alert("The Appointment is overlapping, please change.");
      return false;
    }
    //Verify if the form is validated!
    if (!isCreateModalValidated()) {
      return false;
    }
    //Create obj to insert into array
    var events = {
      "event_title": $('#txtTitle').val(),
      "event_timeFrom": $("#txtTimeA").val(),
      "event_timeTo": $("#txtTimeB").val(),
      "event_date": dateSelected,
      "event_notes": $('#txtNotes').val()
    };
    var cntEventsSameDay = 0;
    //Count how many events are shown in day div
    var cntEventsShown = $(".days:contains('" + dayClicked + "')").find(".eventbar").length
    for (let key in appointments) {
      if (appointments[key].event_date == dateSelected) {
        cntEventsSameDay++;
      }
    }
    if (cntEventsSameDay > 1) {
      dayElement.append("<div class='moreEvents'><a href='#' class='link-more'></a></div>");
      cntMore = isNaN(parseInt(dayElement.find(".moreEvents .link-more").text())) ? 1 : parseInt(dayElement.find(".moreEvents .link-more").text()) + 1;
      dayElement.find(".moreEvents .link-more").html(cntMore + " more");
    } else {
      dayElement.append("<div class='eventbar' data-toggle='modal' data-target='#ModalUpdate'>" + events.event_title + "</div>")
    }
    appointments.push(events); //Add event to the list
    $(".modal").modal("hide");
  });

  //CLICK TODAY BUTTON
  $(document).on("click", "a.today", function() {
    redrawCalendar();
    console.log("today pressed!");
  });

  //CLICK DAY IN CALENDAR!!
  $(document).on("click", ".days , .days weekend", function() {
    cleanModalFields();
    var day = parseInt($(this).text());
    dayClicked = day < 10 ? "0" + day : day;
    $("#lblDay").text("Day " + $(this).text());
    dayElement = $(this);
  });

  //CLICK IN EVENTBAR!
  $(document).on("click", ".eventbar", function(e) {
    lastEventElement = $(this);
    lastEventName = lastEventElement.text();
    console.log(lastEventElement.html());
    cleanModalFields();
    //Prevent firing more than one listener
    e.stopPropagation();
    for (e of appointments) {
      if (e.event_title == $(this).text()) {
        //Fill the data based on title of the eventbar
        $('#utxtTitle').val(e.event_title);
        $('#utxtTimeA').val(e.event_timeFrom);
        $('#utxtTimeB').val(e.event_timeTo);
        $('#utxtNotes').val(e.event_notes);
      }
    }
  });

  //CLICK UPDATE changes
  $(document).on('click', "#btnUpdateEvent", function() {
    if (!isUpdateModalValidated()) {
      return false;
    }
    //Make Changes
    for (var i in appointments) {
      //Update the array based on the title eventbar
      if (appointments[i].event_title == lastEventName) {
        appointments[i].event_title = $('#utxtTitle').val();
        appointments[i].event_timeFrom = $('#utxtTimeA').val();
        appointments[i].event_timeTo = $('#utxtTimeB').val();
        appointments[i].event_notes = $('#utxtNotes').val();
        console.log(appointments);
        lastEventElement.text($('#utxtTitle').val());
        break; //Stop this loop, we found it!
      }
    }
    $(".modal").modal("hide");
  });

  //CLICK DELETE EVENT
  $(document).on('click', "#btnDeleteEvent", function() {
    console.log("deleting event");
    //Make Changes
    for (var i in appointments) {
      for (let j in appointments) {
        console.log(appointments[j].event_title);
        if (appointments[j].event_title == lastEventName) {
          console.log("Deleted! " + appointments[j].event_title);
          appointments.splice(j, 1);
          lastEventElement.remove();
        }
      }
      break; //Stop this loop, we found it!
    }
    $(".modal").modal("hide");
  });

  //BUTTON FORWARD next month
  $(document).on("click", ".forward", function() {
    $('.calendarXBody').html('');
    futureMonth = moment(currentDate).add(1, 'M');
    createDaysCanvas(futureMonth);
    currentDate = futureMonth;
  });

  //BUTTON BACKWARDS previous month
  $(document).on("click", ".previous", function() {
    $('.calendarXBody').html('');
    futureMonth = moment(currentDate).add(-1, 'M');
    createDaysCanvas(futureMonth);
    currentDate = futureMonth;
  });
}
//-----------------------END-CLICK-EVENTS---------------------------------------

function main() {
  //drawCalendar(".calendarX");
  //----------------------------------------------TESTING
  let events = {
    "event_title": "Meeting A",
    "event_timeFrom": '11:11',
    "event_timeTo": '22:00',
    "event_date": '2019-06-25',
    "event_notes": 'testxxxxxxnotas'
  };
  let events2 = {
    "event_title": "Exam",
    "event_timeFrom": '11:12',
    "event_timeTo": '22:22',
    "event_date": '2019-06-03',
    "event_notes": 'testxxxxxxnotas'
  };
  let events3 = {
    "event_title": "Meeting B",
    "event_timeFrom": '11:12',
    "event_timeTo": '22:22',
    "event_date": '2019-06-03',
    "event_notes": 'testexxxxxxnotas'
  };
  appointments.push(events);
  appointments.push(events2);
  appointments.push(events3);
  //---------------------------------------END TEST
  currentDate = moment().format('YYYY-MM-DD');
  currentMonthStr = moment().format('MMMM YYYY');
  assembleHeader(); //Place header
  createDaysCanvas(currentDate); //create day's canvas
  bindClick(); //bind click listeners
}

//Starting point
$(function() {
  main();
});
