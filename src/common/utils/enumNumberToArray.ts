const StringIsNumber = (value: any) => isNaN(Number(value)) === true;

// Turn enum into array
export function EnumToArray(_enum) {
  return Object.keys(_enum)
    .filter(StringIsNumber)
    .map((key) => _enum[key]);
}
