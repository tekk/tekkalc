$(function () {
 
// calculation trigger events
  $(".calculator .a, .calculator .b").keyup(calc);
  $(".calculator .data-type, .calculator .operation").change(calc);
 
// history creation trigger events
  $(".btn-save-history").click(saveHistory);
  $(".calculator .a, .calculator .b").keyup(function (e) {
    var code = e.key;
    if (code === "Enter") {
      saveHistory();
    }
  });
 
  function saveHistory() {
    let calculator = $(".calculator");
    let input = getInput();
    let title = input.type + ': ' + input.a + ' ' + input.operation + ' ' + input.b + ' = ' + calculator.find(".result").text();
    $("#history").append(createCard(title, calculator.html()));
  }
 
  function createCard(title, content) {
    let id = 'accordion-' + new Date().getTime();
    return `
  <div class="card">
      <div class="card-header" >
        <h2 class="mb-0">
          <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#` + id + `" aria-expanded="true" aria-controls="` + id + `" style="width: 100%; text-align: left;">
  ` + title + `
          </button>
        </h2>
      </div>
 
      <div id="` + id + `" class="collapse" aria-labelledby="headingOne" data-parent="#history">
        <div class="card-body">
          ` + content + `
        </div>
      </div>
    </div>
  `;
 
  }
 
  calc();
 
  function getInput() {
    return {
      a: $(".calculator .a").val() || 'A',
      b: $(".calculator .b").val() || 'B',
      type: $(".calculator .data-type").val(),
      operation: $(".calculator .operation").val()
    }
  }
 
  function calc() {
    let input = getInput();
    let a = input.a;
    let b = input.b;
    let type = input.type;
    let operation = input.operation;
 
    let calFactory = new CalculatorFactory();
    let calcAdapter = new CalculatorAdapter(calFactory.getInstance(type));
 
    // calculating
    console.info(a, b, type, operation, calcAdapter);
    let result = calcAdapter.operation(operation, a, b);
    $(".calculator .result").text(result);
 
    // formatting result to different data types
    $(".calculator .result-format").each(function () {
      let row = $(this);
      let toType = row.find(".result-format-data-type").text();
      let rfA = row.find(".result-format-a");
      let rfB = row.find(".result-format-b");
      let rfResult = row.find(".result-format-result");
 
      let converterFactory = new ConverterFactory();
      let converter = converterFactory.getInstance(type, toType);
      if (!converter) {
        console.info("status=no-converter, from, to", type, toType);
        rfA.text("No Converter!");
        return;
      }
 
      rfA.text(converter.convert(a));
      rfB.text(converter.convert(b));
      rfResult.text(converter.convert(result));
    })
  }
 
 
  function ConverterFactory() {
    this.getInstance = function (from, to) {
      console.debug("from=, to=", from, to);
      if (from === to) {
        return new NopConverter();
      }
      return {
        "HEX-DECIMAL": new HexToDecimalConverter(),
        "HEX-FLOAT": new HexToFloatConverter(),
        "HEX-DOUBLE": new HexToDoubleConverter(),
        "HEX-HEX LITTLE ENDIAN": new HexToLittleEndianConverter(),
        "DECIMAL-HEX": new DecimalToHexConverter(),
        "DECIMAL-HEX LITTLE ENDIAN": new DecimalToLittleEndianConverter(),
        "DECIMAL-FLOAT": new DecimalToFloatConverter(),
        "DECIMAL-DOUBLE": new DecimalToFloatConverter(),
        "FLOAT-DECIMAL": new FloatToDecimalConverter(),
        "FLOAT-DOUBLE": new NopConverter(),
        "FLOAT-HEX": new FloatToHexConverter(),
        "FLOAT-HEX LITTLE ENDIAN": new FloatToLittleEndianConverter(),
        "DOUBLE-DECIMAL": new FloatToDecimalConverter(),
        "DOUBLE-FLOAT": new NopConverter(),
        "DOUBLE-HEX": new DoubleToHexConverter(),
        "DOUBLE-HEX LITTLE ENDIAN": new DoubleToLittleEndianConverter(),
      }[from + "-" + to];
    }
  }
 
  function CalculatorFactory() {
 
    this.getInstance = function (type) {
      console.info("m=getInstance, type=", type)
      return {
        "HEX": new HexCalculator(),
        "DECIMAL": new DecimalCalculator(),
        "FLOAT": new DecimalCalculator(),
        "DOUBLE": new DecimalCalculator()
      }[type];
    }
 
  }
 
  function CalculatorAdapter(calculator) {
 
    this.operation = function (operator, a, b) {
      console.info("operating: ", calculator);
      switch (operator) {
        case '+':
          return calculator.plus(a, b);
        case '-':
          return calculator.minus(a, b);
        case '*':
          return calculator.multiply(a, b);
        case '/':
          return calculator.divide(a, b);
      }
    }
 
  }
 
 
  function HexCalculator() {
 
    this.decCalculator = new DecimalCalculator();
    this.hexToDecimalConverter = new HexToDecimalConverter();
    this.decimalToHexConverter = new DecimalToHexConverter();
 
    this.plus = function (a, b) {
      let r = this.decCalculator.plus(
        this.hexToDecimalConverter.convert(a), this.hexToDecimalConverter.convert(b)
      );
      return this.decimalToHexConverter.convert(r);
    }
 
    this.minus = function (a, b) {
      let r = this.decCalculator.minus(
        this.hexToDecimalConverter.convert(a), this.hexToDecimalConverter.convert(b)
      );
      return this.decimalToHexConverter.convert(r);
    }
 
    this.multiply = function (a, b) {
      let r = this.decCalculator.multiply(
        this.hexToDecimalConverter.convert(a), this.hexToDecimalConverter.convert(b)
      );
      return this.decimalToHexConverter.convert(r);
    }
 
    this.divide = function (a, b) {
      let r = this.decCalculator.divide(
        this.hexToDecimalConverter.convert(a), this.hexToDecimalConverter.convert(b)
      );
      return this.decimalToHexConverter.convert(r);
    }
 
  }
 
  function DecimalCalculator() {
 
    this.plus = function (a, b) {
      let r = Number(a) + Number(b);
      console.debug("dec-cal, m=plus, r=", r);
      return r;
    }
 
    this.minus = function (a, b) {
      let r = Number(a) - Number(b);
      console.debug("dec-cal, m=plus, r=", r);
      return r;
    }
 
    this.multiply = function (a, b) {
      let r = Number(a) * Number(b);
      console.debug("dec-cal, m=plus, r=", r);
      return r;
    }
 
    this.divide = function (a, b) {
      let r = Number(a) / Number(b);
      console.debug("dec-cal, m=plus, r=", r);
      return r;
    }
 
  }
 
  function HexToDecimalConverter() {
 
    this.convert = function (source) {
      let r = parseInt(source, 16);
      console.debug("m=hextodecimal, source=, r=", source, r);
      return r;
    }
 
  }
 
  function DecimalToHexConverter() {
 
    this.convert = function (source) {
      let r = parseInt(source).toString(16).toUpperCase()
      console.debug("m=decimal-to-hex, source=, r=", source, r);
      return r;
    }
 
  }
 
  function DecimalToLittleEndianConverter() {
 
    this.decimalToHex = new DecimalToHexConverter();
    this.hexToLittleEndian = new HexToLittleEndianConverter();
 
    this.convert = function (source) {
      return this.hexToLittleEndian.convert(this.decimalToHex.convert(source));
    }
  }
 
 
  function NopConverter() {
    this.convert = function (source) {
      return source;
    }
  }
 
 
  function DecimalToFloatConverter() {
    this.convert = function (source) {
      return Number(source).toFixed(2);
    }
  }
 
  function FloatToDecimalConverter() {
    this.convert = function (source) {
      return Number(source).toFixed(0);
    }
  }
 
  function HexToLittleEndianConverter() {
    this.convert = function (source) {
 
      if (source.length % 2 == 1) {
        source = source.padStart(source.length + 1, '0');
      }
 
      let buff = "";
      for (let i = source.length - 1; i > 0; i -= 2) {
        buff = buff.concat(source[i - 1]);
        buff = buff.concat(source[i]);
      }
      return buff;
    }
  }
 
  function HexToFloatConverter() {
    this.convert = function (source) {
      return hexToFloat('0x' + source).toFixed(3);
    }
 
    function hexToFloat(str) {
      var float = 0, sign, order, mantiss, exp,
        int = 0, multi = 1;
      if (/^0x/.exec(str)) {
        int = parseInt(str, 16);
      } else {
        for (var i = str.length - 1; i >= 0; i -= 1) {
          if (str.charCodeAt(i) > 255) {
            console.log('Wrong string parametr');
            return false;
          }
          int += str.charCodeAt(i) * multi;
          multi *= 256;
        }
      }
      sign = (int >>> 31) ? -1 : 1;
      exp = (int >>> 23 & 0xff) - 127;
      mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
      for (let i = 0; i < mantissa.length; i += 1) {
        float += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0;
        exp--;
      }
      return float * sign;
    }
  }
 
  function HexToDoubleConverter() {
    this.convert = function (source) {
      return hexToDouble(source).toFixed(3);
    }
 
    function hexToDouble(str) {
      str = str.padEnd(16, '0');
      let a = parseInt(str.substring(0, 8), 16);
      let b = parseInt(str.substring(8, 16), 16);
      console.debug(str, a, b, str.substring(0, 8), str.substring(8, 16));
      let e = (a >> 52 - 32 & 0x7ff) - 1023;
      return (a & 0xfffff | 0x100000) * 1.0 / Math.pow(2, 52 - 32) * Math.pow(2, e) + b * 1.0 / Math.pow(2, 52) * Math.pow(2, e);
    }
  }
 
  function FloatToHexConverter() {
    this.convert = function (source) {
      let getHex = i => ('00' + i.toString(16)).slice(-2);
      let view = new DataView(new ArrayBuffer(4)), result;
      view.setFloat32(0, Number(source));
      return Array
        .apply(null, {length: 4})
        .map((_, i) => getHex(view.getUint8(i)))
        .join('')
        .toUpperCase();
 
    }
  }
 
  function FloatToLittleEndianConverter() {
    this.floatToHex = new FloatToHexConverter();
    this.hexToLittleEndian = new HexToLittleEndianConverter();
 
    this.convert = function (source) {
      return this.hexToLittleEndian.convert(this.floatToHex.convert(source));
    }
  }
 
 
  function DoubleToHexConverter() {
    this.convert = function (source) {
      let getHex = i => ('00' + i.toString(16)).slice(-2);
      let view = new DataView(new ArrayBuffer(8)), result;
      view.setFloat64(0, Number(source));
      return Array
        .apply(null, {length: 8})
        .map((_, i) => getHex(view.getUint8(i)))
        .join('')
        .toUpperCase();
 
    }
  }
 
  function DoubleToLittleEndianConverter() {
    this.doubleToHex = new DoubleToHexConverter();
    this.hexToLittleEndian = new HexToLittleEndianConverter();
 
    this.convert = function (source) {
      return this.hexToLittleEndian.convert(this.doubleToHex.convert(source));
    }
  }
 
});
