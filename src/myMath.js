
function linearRegression(values_x, values_y){
	var lr = {};
	var n = values_y.length;
	var sum_x = 0;
	var sum_y = 0;
	var sum_xy = 0;
	var sum_xx = 0;
	var sum_yy = 0;

	for (var i = 0; i < values_y.length; i++) {

			sum_x += values_x[i];
			sum_y += values_y[i];
			sum_xy += (values_x[i]*values_y[i]);
			sum_xx += (values_x[i]*values_x[i]);
			sum_yy += (values_y[i]*values_y[i]);
	} 

	lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
	lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
	lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

	return lr;
}

export { linearRegression }