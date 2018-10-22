$(function() {
    $("#btnFinder").on("click", function () {
        var initial = $("#initial").val();
        $.ajax({
            url: "/json/countries?q=" + initial,
            cache: false
        }).done(function (json) {
            var dataTemplate = $("#country-template").html();
            $("#output").html(Mustache.to_html(dataTemplate, json));
        });
    });
})