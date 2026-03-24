/*! JSFuck 0.4.0 - http://jsfuck.com */
// @ts-nocheck

interface JSFuckApi {
    encode: (input: string, wrapWithEval?: boolean) => string;
}

const selfRef: { JSFuck?: JSFuckApi } = {};

(function(self){
    const USE_CHAR_CODE = "USE_CHAR_CODE";
    const MIN = 32;
    const MAX = 126;

    const SIMPLE = {
        false: "![]",
        true: "!![]",
        undefined: "[][[]]",
        NaN: "+[![]]",
        Infinity: "+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])",
    };

    const CONSTRUCTORS = {
        Array: "[]",
        Number: "(+[])",
        String: "([]+[])",
        Boolean: "(![])",
        Function: "[]['filter']",
        RegExp: "Function('return/0/')()",
    };

    const MAPPING = {
        a: "(false+'')[1]",
        b: "(+(11))['toString'](20)",
        c: "([]['filter']+'')[3]",
        d: "(undefined+'')[2]",
        e: "(true+'')[3]",
        f: "(false+'')[0]",
        g: "(+false+[false]+String)[20]",
        h: "(+(101))['toString'](21)[1]",
        i: "([false]+undefined)[10]",
        j: "(+(40))['toString'](21)[1]",
        k: "(+(20))['toString'](21)",
        l: "(false+'')[2]",
        m: "(Number+'')[11]",
        n: "(undefined+'')[1]",
        o: "(true+[]['filter'])[10]",
        p: "(+(211))['toString'](31)[1]",
        q: "(+(212))['toString'](31)[1]",
        r: "(true+'')[1]",
        s: "(false+'')[3]",
        t: "(true+'')[0]",
        u: "(undefined+'')[0]",
        v: "(+(31))['toString'](32)",
        w: "(+(32))['toString'](33)",
        x: "(+(101))['toString'](34)[1]",
        y: "(NaN+[Infinity])[10]",
        z: "(+(35))['toString'](36)",

        A: "(+false+Array)[10]",
        B: "(+false+Boolean)[10]",
        C: "Function('return escape')()('<')[2]",
        D: "Function('return escape')()('=')[2]",
        E: "(RegExp+'')[12]",
        F: "(+false+Function)[10]",
        G: "(false+Function('return Date')()())[30]",
        H: USE_CHAR_CODE,
        I: "(Infinity+'')[0]",
        K: USE_CHAR_CODE,
        L: USE_CHAR_CODE,
        M: "(true+Function('return Date')()())[30]",
        N: "(NaN+'')[0]",
        P: USE_CHAR_CODE,
        Q: USE_CHAR_CODE,
        R: "(+false+RegExp)[10]",
        S: "(+false+String)[10]",
        T: "(NaN+Function('return Date')()())[30]",
        U: USE_CHAR_CODE,
        V: USE_CHAR_CODE,
        W: USE_CHAR_CODE,
        X: USE_CHAR_CODE,
        Y: USE_CHAR_CODE,
        Z: USE_CHAR_CODE,

        " ": "(NaN+[]['filter'])[11]",
        "!": USE_CHAR_CODE,
        "\"": "('')['fontcolor']()[12]",
        "#": USE_CHAR_CODE,
        $: USE_CHAR_CODE,
        "%": "Function('return escape')()('<')[0]",
        "&": USE_CHAR_CODE,
        "'": USE_CHAR_CODE,
        "(": "(false+[]['filter'])[20]",
        ")": "(true+[]['filter'])[20]",
        "*": USE_CHAR_CODE,
        "+": "(+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]])+[])[2]",
        ",": "[[]]['concat']([[]])+''",
        "-": "(+(.+[0000000001])+'')[2]",
        ".": "(+(+!+[]+[+!+[]]+(!![]+[])[!+[]+!+[]+!+[]]+[!+[]+!+[]]+[+[]])+[])[+!+[]]",
        "/": "(false+[+false])['italics']()[10]",
        ":": "(RegExp()+'')[3]",
        ";": USE_CHAR_CODE,
        "<": "('')['italics']()[0]",
        "=": "('')['fontcolor']()[11]",
        ">": "('')['italics']()[2]",
        "?": "(RegExp()+'')[2]",
        "@": USE_CHAR_CODE,
        "[": "(GLOBAL+'')[0]",
        "\\": USE_CHAR_CODE,
        "]": USE_CHAR_CODE,
        "^": USE_CHAR_CODE,
        _: USE_CHAR_CODE,
        "`": USE_CHAR_CODE,
        "{": "(NaN+[]['filter'])[21]",
        "|": USE_CHAR_CODE,
        "}": USE_CHAR_CODE,
        "~": USE_CHAR_CODE,
    };

    const GLOBAL = "Function('return this')()";

    function fillMissingChars(){
        for (const key in MAPPING){
            if (MAPPING[key] === USE_CHAR_CODE){
                MAPPING[key] = "Function('return unescape')()('%'" + key.charCodeAt(0).toString(16).replace(/(\d+)/g, "+($1)+'") + "')";
            }
        }
    }

    function fillMissingDigits(){
        let output;
        let i;

        for (let number = 0; number < 10; number++){
            output = "+[]";
            if (number > 0) {
                output = "+!" + output;
            }
            for (i = 1; i < number; i++) {
                output = "+!+[]" + output;
            }
            if (number > 1) {
                output = output.substr(1);
            }
            MAPPING[number] = "[" + output + "]";
        }
    }

    function replaceMap(){
        let character = "";
        let value;
        let i;
        let key;

        function replace(pattern, replacement){
            value = value.replace(new RegExp(pattern, "gi"), replacement);
        }

        function digitReplacer(_, x) {
            return MAPPING[x];
        }

        function numberReplacer(_, y) {
            const values = y.split("");
            const head = +(values.shift());
            let output = "+[]";
            if (head > 0) {
                output = "+!" + output;
            }
            for (i = 1; i < head; i++) {
                output = "+!+[]" + output;
            }
            if (head > 1) {
                output = output.substr(1);
            }
            return [output].concat(values).join("+").replace(/(\d)/g, digitReplacer);
        }

        for (i = MIN; i <= MAX; i++){
            character = String.fromCharCode(i);
            value = MAPPING[character];
            if (!value) {
                continue;
            }

            for (key in CONSTRUCTORS){
                replace("\\b" + key, CONSTRUCTORS[key] + "['constructor']");
            }

            for (key in SIMPLE){
                replace(key, SIMPLE[key]);
            }

            replace("(\\d\\d+)", numberReplacer);
            replace("\\((\\d)\\)", digitReplacer);
            replace("\\[(\\d)\\]", digitReplacer);
            replace("GLOBAL", GLOBAL);
            replace("\\+''", "+[]");
            replace("''", "[]+[]");

            MAPPING[character] = value;
        }
    }

    function replaceStrings(){
        const regEx = /[^\[\]\(\)\!\+]{1}/g;
        let all;
        let value;
        let missing;
        let count = MAX - MIN;

        function findMissing(){
            let done = false;
            missing = {};
            for (all in MAPPING){
                value = MAPPING[all];
                if (value.match(regEx)){
                    missing[all] = value;
                    done = true;
                }
            }
            return done;
        }

        function mappingReplacer(_, b) {
            return b.split("").join("+");
        }

        function valueReplacer(c) {
            return missing[c] ? c : MAPPING[c];
        }

        for (all in MAPPING){
            MAPPING[all] = MAPPING[all].replace(/\"([^\"]+)\"/gi, mappingReplacer);
        }

        while (findMissing()){
            for (all in missing){
                value = MAPPING[all];
                value = value.replace(regEx, valueReplacer);
                MAPPING[all] = value;
                missing[all] = value;
            }

            if (count-- === 0){
                console.error("Could not compile the following chars:", missing);
            }
        }
    }

    function encode(input, wrapWithEval){
        let output: string[] | string = [];

        if (!input){
            return "";
        }

        let r = "";
        for (const i in SIMPLE) {
            r += i + "|";
        }
        r += ".";

        input.replace(new RegExp(r, "g"), function(c) {
            let replacement = SIMPLE[c];
            if (replacement) {
                output.push("[" + replacement + "]+[]");
            } else {
                replacement = MAPPING[c];
                if (replacement){
                    output.push(replacement);
                } else if (c === "J") {
                    replacement = "([][" + encode("filter") + "][" + encode("constructor") + "](" + encode("return new Date(200000000)") + ")()+[])[!+[]+!+[]+!+[]+!+[]]";
                    output.push(replacement);
                    MAPPING[c] = replacement;
                } else if (c === "O") {
                    replacement = "([][" + encode("filter") + "][" + encode("constructor") + "](" + encode("return new Date(24000000000)") + ")()+[])[!+[]+!+[]+!+[]+!+[]]";
                    output.push(replacement);
                    MAPPING[c] = replacement;
                } else {
                    replacement = "([]+[])[" + encode("constructor") + "][" + encode("fromCharCode") + "](" + encode(c.charCodeAt(0) + "") + ")";
                    output.push(replacement);
                    MAPPING[c] = replacement;
                }
            }
            return c;
        });

        output = output.join("+");
        if (/^\d$/.test(input)){
            output += "+[]";
        }

        if (wrapWithEval){
            output = "[][" + encode("filter") + "][" + encode("constructor") + "](" + output + ")()";
        }

        return output;
    }

    fillMissingDigits();
    fillMissingChars();
    replaceMap();
    replaceStrings();

    self.JSFuck = {
        encode,
    };
})(selfRef);

export const JSFuck = selfRef.JSFuck as JSFuckApi;
