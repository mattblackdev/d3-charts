export default function tweenPie(b) {
  var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b)
  return function(t) {
    const obj = i(t)
    if (obj.index === 3) {
      console.log(obj.startAngle, obj.endAngle)
    }
    return arc(i(t))
  }
}
