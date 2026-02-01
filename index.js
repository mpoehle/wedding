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

  $("#photos .pic:first").toggleClass("visible")

  let timeout = null

  const next_pic = () => {
    const current = $("#photos .pic.visible")
    let next = current.next().first()
    if (!current.length || !next.length) {
        next = $("#photos .pic:first")
    }
    current.toggleClass("visible")
    next.toggleClass("visible")
    if (timeout) {
        clearTimeout(timeout)
    }
    timeout = setTimeout( next_pic, 4000)
  }

  timeout = setTimeout( next_pic, 4000)
  $("#photos .pic").click(next_pic)
})
