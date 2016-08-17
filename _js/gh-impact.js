/*
Ian Dennis Miller
*/

var query = function() {

    var account_name = $("#account_name_query").val();
    if ((!account_name) || (account_name == "undefined")) {
        return(false);
    }

    // first clear all fields
    $("#account_name").html("");
    $("#impact_score").html("");
    $("#percentile").html("");
    $("#account_type").html("");

    // then hide and reveal the correct blocks
    $("#masked").css("display", "block");
    $("#examples").css("display", "none");
    $("#search_box").css("display", "none");

    var bucket = $.md5(account_name.toLowerCase()).slice(0, 2);

    $.getJSON( "data/json/" + bucket + ".json", function(data) {
        var account = data[account_name.toLowerCase()];
        if (account != undefined) {
            $("#account_name").html("<a target='_blank' href='http://github.com/" + account["l"] + "'>" + account["l"] + "</a>");
            $("#impact_score").html("<a href='http://www.gh-impact.com/#" + account["l"] + "'>" + account["s"] + "</a>");
            if (account["t"] == 1) {
                $("#account_type").html("Individual");
            }
            else {
                $("#account_type").html("Organization");
            }
            show_percentile(account["s"], account["t"]);
            location.hash = account["l"];
            document.title = "gh-impact report: " + account["l"];

            ga('send', {
                hitType: 'event',
                eventCategory: 'search',
                eventAction: 'query',
                eventLabel: account_name,
                eventValue: 1
            });
        }
        else {
            $("#account_name").html("not found");
            $("#impact_score").html("");
            location.hash = "!notfound";

            ga('send', {
                hitType: 'event',
                eventCategory: 'search',
                eventAction: 'not_found',
                eventLabel: account_name,
                eventValue: 1
            });
        }
    });
}

var show_percentile = function(score, account_type) {

    var result;

    if (account_type == 1) { // individual
        if (score < 15) {
            result = Math.round(percentiles[0][score] * 100);
        }
        else {
            result = 99;
        }
    }
    else { //organziation
        if (score < 15) {
            result = Math.round(percentiles[1][score] * 100);
        }
        else {
            result = 99;
        }
    }

    $("#percentile").html(result);
}

var run_location = function() {
    if (location.hash != "") {
        var q = location.hash;
        q = q.substring(1, location.hash.length);
        $("#account_name_query").val(q);
        query();

        ga('send', {
            hitType: 'event',
            eventCategory: 'index',
            eventAction: 'run_location',
            eventLabel: q,
            eventValue: 1
        });
    }
    else {
        $("#masked").css("display", "none");
        $("#account_name_query").val("");
        $("#search_box").css("display", "block");

        setTimeout(function(){
            $("#account_name_query").focus();
        }, 1);

        show_examples();
    }
}

var examples_ready = false;

var generate_examples = function() {
    if (examples_ready) { return(false); }

    var examples = [];
    examples = examples.concat(leaderboard_individuals);
    examples = examples.concat(leaderboard_organizations);
    examples.push({login: "iandennismiller", gh_impact: 4});

    initRandomBucket(examples.length);

    var root_element = $("#examples ul");

    for (var i = 0; i < 5; i++) {
        var account = examples[getRandomFromBucket()].login;
        console.log(account);
        var link = $("<a>").attr("href", "/#" + account).html(account);
        var node = $("<li>");
        node.append($("<span class='example'>").html(link));
        root_element.append(node);
    }

    examples_ready = true;
    return(true);
}

var show_examples = function() {
    generate_examples();
    $("#examples").show();

    ga('send', {
        hitType: 'event',
        eventCategory: 'index',
        eventAction: 'show_examples',
        eventValue: 1
    });
}

var handle_enter = function (e) {
    if (e.which == 13) {
        query();
        return false;
    }
}

var index_main = function() {
    $("#search").removeAttr("href");
    $("#search").click(query);
    $('#search').keypress(handle_enter);

    $('#account_name_query').keypress(handle_enter);

    $(window).on('hashchange', run_location);
    run_location();
}

var leaderboard_populate = function(element, leaderboard_array) {
    for (var idx in leaderboard_array) {
        var account = leaderboard_array[idx];
        console.log(account);
        var entry = $("<li>");
        var link = $("<a>").attr("href", "/#" + account.login).html(account.login);
        entry.append(
            // $("<span class='leader_login'>").html(account.login),
            $("<span class='leader_login'>").html(link),
            $("<span class='leader_gh_impact'>").html(account.gh_impact)
        );
        element.append(entry);
    }
}

var leaderboard_main = function() {
    $("#individuals").append($("<ul>"));
    $("#organizations").append($("<ul>"));

    leaderboard_populate($("#individuals ul"), leaderboard_individuals);
    leaderboard_populate($("#organizations ul"), leaderboard_organizations);
}

var track_clicks = function() {
    $(".outbound").click(function() {
        trackOutboundLink($(this).attr("href"));
        return(false);
    })
}

$(track_clicks);
