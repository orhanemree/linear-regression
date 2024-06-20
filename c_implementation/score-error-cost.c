// my math funcs are better
#define SQ_(n) ((n)*(n))
#define ABS_(n) ((int)(n)>=0?(n):(-1*(n)))

double SQRT_(double x) {
    double guess = x / 2.0;
    double error = 0.0001;
    while (ABS_(guess * guess - x) > error) {
        guess = (guess + x / guess) / 2.0;
    }
    return guess;
}


double calculateMSE(double *x, double *y, int n, double m, double b) {
    // x and y are array

    double errors = 0.0;

    for (int i = 0; i < n; ++i) {
        errors += SQ_((m*x[i]+b)-y[i]);
    }

    return errors/n;
}


double calculateRMSE(double *x, double *y, int n, double m, double b) {
    // x and y are array

    double errors = 0.0;

    for (int i = 0; i < n; ++i) {
        errors += SQ_((m*x[i]+b)-y[i]);
    }

    return SQRT_(errors/n);
}


double calculateRSquared(double *x, double *y, int n, double m, double b) {
    // x and y are array

    // find mean y
    double y_sum = 0.0;
    for (int i = 0; i < n; ++i) {
        y_sum += y[i];
    }
    double y_mean = y_sum/n;

    double ssr = 0.0, sst = 0.0;

    for (int i = 0; i < n; ++i) {
        ssr += SQ_((m*x[i]+b)-y_mean);
        sst += SQ_(y[i]-y_mean);
    }

    return ssr / sst;
}
