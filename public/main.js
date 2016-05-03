// fix updating data
// make it look pretty

var tweets = {};
var chart = undefined;

function removeTimeFromDate(timestamp) {
  return timestamp.split(" ")[0];
}

function getMonth(date) {
  return date.split('-')[1];
}

function getTotalTweetsPerDay(filter, excludeRts) {
  var dates = [];
  var results = [];

  var currentDate = tweets[0][1];
  currentDate = removeTimeFromDate(currentDate);
  dates.push(currentDate);

  tweets.forEach(function(tweet) {
    if (tweet == undefined || tweet == "") {
      return;
    }

    tweet[1] = removeTimeFromDate(tweet[1]);

    if (tweet[1] != currentDate) {
      currentDate = tweet[1];
      dates.push(currentDate);
    }

    var index = dates.indexOf(currentDate);
    if (!results[index]) {
      results[index] = 0;
    }

    var txt = tweet[2].toLowerCase();

    if (excludeRts && txt.startsWith("\"")) {
      return;
    }

    if (filter) {

      if (txt.indexOf(filter.toLowerCase()) != -1) {
        results[index]++;
      }
    }
    else {
      results[index]++;
    }
  });

  dates.reverse();
  results.reverse();

  return {
    'totals': results,
    'labels': dates
  };
}

function buildGraph(filter, excludeRts) {
  var twts = getTotalTweetsPerDay("", excludeRts);
  var twts_f = getTotalTweetsPerDay(filter, excludeRts);

  if (chart != undefined) {
    chart.destroy();
  }

  var ctx = $("#tweets");
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: twts.labels,
      datasets: [
        {
          label: filter + " mentions",
          type: 'bar',
          data: twts_f.totals,
          borderColor: "#4a8fd3",
          backgroundColor: "#4a8fd3"
        },
        {
          label: "Trump tweets",
          type: 'line',
          fill: true,
          data: twts.totals,
          borderColor: "#d65454",
          backgroundColor: "#d65454"
        }
      ]
    },
    settings: {
      defaultColor: "#FFFFFF"
    }
  });
}

function getIncludeRT() {
  return !$('#rt').prop('checked');
}

$(document).on('ready', function() {
  console.log("downloading tweets...");

  Chart.defaults.global.defaultColor = "#FFFFFF";

  Papa.parse("tweets.csv", {
  	download: true,
  	complete: function(results) {
  		results.data.splice(0, 1);
      tweets = results.data;

      buildGraph($('#search').val(), getIncludeRT());
  	}
  });

  $('#search').change(function() {
    buildGraph($(this).val(), getIncludeRT());
  });

  $('#rt').change(function() {
    buildGraph($('#search').val(), getIncludeRT());
  });

});
