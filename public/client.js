$( document ).ready(function() {

    var formMap = new Map();
    formMap.set(".api-url-form", getAPIUrl);
    formMap.set(".client-secret-form", getLoginKey);
    formMap.set(".report-suite-form", getReportSuites);
    formMap.set(".variables-form", getVariables);
    formMap.set(".events-form", getEvents);

    var API = "http://127.0.0.1:3002/api";

    $(".demo-section").hide();
    $(".api-url-result").hide();
    $(".client-secret-result").hide();
    $(".report-suite-result").hide();
    $(".variables-result").hide();
    $(".events-result").hide();
    $(".report-suite-section").hide();
    $(".variables-section").hide();
    $(".events-section").hide();
    $(".other-section").hide();

    Ladda.bind( 'button[type=submit]' );

    /**
     * We use foo/bar user to get the generic api
     */
    function getAPIUrl() {

        return $.ajax({
            url: API + "/companies?method=Company.GetEndpoint",
            method: "POST",
            data: {
                apiURL: window.api_url,
                company: $("#company-field").val(),
                login: $("#login-field").val() || "foo",
                password: $("#password-field").val() || "bar"
            }
        })
        .done(function( data ) {
            window.api_url = data;
            $(".api-url-value").text(window.api_url);
            $(".api-url-result").show();
            $(".demo-section").show();
        });
    }

    function getLoginKey() {

        var company = $("#company-field").val(),
            login = $("#login-field").val(),
            password = $("#password-field").val();

        return $.ajax({
            url: API + "/companies?method=Company.GetLoginKey",
            method: "POST",
            data: {
                apiURL: window.api_url,
                company: company,
                login : login,
                password : password
            }
        })
        .done(function( data ) {
            window.username = login + ":" + company;
            window.client_secret = data;
            $(".client-secret-value").text(data);
            $(".client-secret-result").show();
            $(".report-suite-section").show();
        });
    }

    function getReportSuites () {
        return $.ajax({
            url: API + "/reports?method=Company.GetReportSuites",
            method: "POST",
            data: {
                apiURL: window.api_url,
                sp: $("#report-suite-field").val(),
                username: window.username,
                secret: window.client_secret
            }
        })
        .done(function( data ) {
            var rs = data.result.report_suites[0],
                rsid = rs.rsid,
                rsName = rs.site_title;
            $(".company-get-report-suites-result").append(rsid + " " + rsName);
            $(".report-suite-result").show();
            $(".variables-section").show();
        });
    }

    function getVariables() {
        return $.ajax({
            url: API + "/variables?method=Report.GetElements",
            method: "POST",
            data: {
                apiURL: window.api_url,
                reportSuiteID: $("#report-suite-field").val(),
                username: window.username,
                secret: window.client_secret
            }
        })
        .done(function( data ) {
            data.result.forEach(function(report, index) {
                $(".report-get-elements-result").append((index+1) + ") " + report.id + " - " + report.name + "<br>");
            })

            $(".variables-result").show();
            $(".events-section").show();
        });
    }

    function getEvents() {
        return $.ajax({
            url: API + "/variables?method=Report.GetMetrics",
            method: "POST",
            data: {
                apiURL: window.api_url,
                reportSuiteID: $("#report-suite-field").val(),
                username: window.username,
                secret: window.client_secret
            }
        })
            .done(function( data ) {
                data.result.forEach(function(report, index) {
                    $(".report-get-events-result").append((index+1) + ") " + report.id + " - " + report.name + "<br>");
                })

                $(".events-result").show();
                $(".other-section").show();
            });
    }


    function handleSubmission ($button, callback) {
        var l = Ladda.create($button[0]);
        l.start();

        callback()
            .always(function() { l.stop(); });

        return false;
    }

    function setupSubmission (formClass) {
        var $form = $(formClass);

        $form.submit(function (e) {
                return handleSubmission($form.find("button"), formMap.get(formClass));
            });
    }

    setupSubmission(".api-url-form");
    setupSubmission(".client-secret-form");
    setupSubmission(".report-suite-form");
    setupSubmission(".variables-form");
    setupSubmission(".events-form");
});


