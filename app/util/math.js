export function boundingBoxIntersecting(obj1, obj2) {
  if(obj1.center.x + obj1.size.x / 2 < obj2.center.x - obj2.size.x / 2) {
    return false;
  } else if(obj1.center.x - obj1.size.x / 2 > obj2.center.x + obj2.size.x / 2) {
    return false;
  } else if(obj1.center.y - obj1.size.y / 2 > obj2.center.y + obj2.size.y / 2) {
    return false;
  } else if(obj1.center.y + obj1.size.y / 2 < obj2.center.y - obj2.size.y / 2) {
    return false
  } else {
    return true;
  }
}

export function calcVector(magnitude, rad) {
  var x = magnitude * Math.cos(rad);
  var y = magnitude * Math.sin(rad);
  return { x: x, y: y };
}

