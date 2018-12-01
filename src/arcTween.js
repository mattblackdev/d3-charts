export default function arcTween(oldData, newData, arc) {
  const copy = Object.assign({}, oldData)
  return () => {
    const interpolateStartAngle = d3.interpolate(
      oldData.startAngle,
      newData.startAngle
    )
    const interpolateEndAngle = d3.interpolate(
      oldData.endAngle,
      oldData.endAngle
    )
    return t => {
      copy.startAngle = interpolateStartAngle(t)
      copy.endAngle = interpolateEndAngle(t)
      return arc(copy)
    }
  }
}
