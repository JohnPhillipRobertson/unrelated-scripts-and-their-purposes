/*
An explanation:
A Catalog Item was needed that took a list of records and gave their condition filters (company is $ID, active is false, and so on) as a csv file.
"current" is the item itself, and contains the textfield in which the records are named
"gs" is a global object, here used for logging
The naming convention for GlideRecords is to call it, if it is the only one in a script, "gr"
Each record has four conditions, reset, stop, pause, and start, to be pulled; the record name + the condition filter's name becomes a header at the end.
rotateLeft was copied from stackoverflow.
tokenize splits up by newline, introduced by way of nl_op; 
this was necessary to do this because IN and NOT IN filters follow the format "fooINbar,baz,qux" and would otherwise not be parsed properly if split on.
The boolean operators are ignored and the rest of the arrays are turned into "breadcrumbs," lookups of the elements in the part of the filter (company is $ID becomes company is $NAME_REFERRED_TO_BY_ID)
The commas from INs are escaped, the array is rotated so that the left becomes the headers at the top,
the filters array is rebuilt as a raw csv text, and the csv is sent to the RITM from the Catalog Item.
*/

var csvData = '';
var q = current.variables.slads + '';
q = q.split('\n').join(',');
var gr = new GlideRecord('contract_sla');
gr.addEncodedQuery('nameIN' + q);
gr.query();
var filters = [];
while (gr.next()) {
	filters.push(gr.name + ' reset condition\n' + gr.reset_condition.toString());
	filters.push(gr.name + ' stop condition\n' + gr.stop_condition.toString());
	filters.push(gr.name + ' pause condition\n' + gr.pause_condition.toString());
	filters.push(gr.name + ' start condition\n' + gr.start_condition.toString());
}

var nl_op = {
	'\\^OR': '\nOr\n',
	'\\^NQ': '\nOr all of the following conditions must be met:\n',
	'\\^EQ': '\nEnd query.',
	'\\^(?!NQ|EQ|OR)': '\nAnd\n'
};

function rotateLeft(array) {
	var result = [];
	array.forEach(function (a, i, aa) {
		a.forEach(function (b, j, bb) {
			result[j] = result[j] || [];
			result[j][aa.length - i - 1] = b;
		});
	});
	return result;
}

function tokenize(str) {
	var re;
	var key;
	var nl_sep = Object.keys(nl_op);
	for (var j = 0; j < nl_sep.length; j++) {
		key = nl_sep[j];
		re = new RegExp(key, 'g');
		str = str.replace(re, nl_op[key]);
	}
	str = str.split('\n');
	for (j = 1; j < str.length; j++) {
		var bool = true;
		for (var k = 0; k < nl_sep.length; k++) {
			bool = bool && nl_op[nl_sep[k]].indexOf(str[j]) == -1; //Is not a substring of
		}
		if (bool) {
			var text = new GlideQueryBreadcrumbs().getReadableQuery('contract_sla', str[j]);
			text = text.toString() + '';
			str[j] = text;
		}
		if (str[j].match(/,/)) {
			str[j] = '"' + str[j] + '"';
		}
	}
	return str;
}

//gs.log('jr filters1: ' + filters);

for (var i = 0; i < filters.length; i++) {
	filters[i] = tokenize(filters[i]);
}

//gs.log('jr filters2: ' + filters + '\n' + Array.isArray(filters));

filters = rotateLeft(filters);
//gs.log('jr filters rotate: ' + filters + '\n' + Array.isArray(filters));
for (i = 0; i < filters.length; i++) {
	csvData += filters[i] + '\r\n';
}

//gs.log('jr csvdata\n' + csvData);

var grAttachment = new GlideSysAttachment();
grAttachment.write(current, 'sla_definition_filters.csv', 'application/csv', csvData);