$(document).ready(() => {
  $("#leaves").css({"top": 0})
  $("#header").css({"opacity": 1})
  $("#content").css({"opacity": 1})
  
  wed_date = new Date(2026, 4, 19)
  days_left = 1 + Math.floor((wed_date - new Date()) / (1000 * 60 * 60 * 24))
  $("#countdown").html("just " + days_left + " days to go!")

  $(".navitem").each((idx, el) => {
    $(el).click((event) => {
        const to = $(event.target).data("linkto")
        console.log(to)
        $("#content > div").hide()
        $("#" + to).show()
      })
  })
  $("#content > div:not(#home)").hide()
})
