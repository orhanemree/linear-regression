#include <stdio.h>
#include "score-error-cost.c"


// linear regression implementation with OLS method and a simple example


void linearRegression(double x[], double y[], int n, double *m, double *b) {

    // x: array of x independent
    // y: array of y dependent
    // n: length of x and y arrays
    // m: m of y = m*x+b updated in-place
    // b: b of y = m*x+b updated in-place
    
    double x_sum = 0, y_sum = 0;

    // find x and y mean
    for (int i = 0; i < n; ++i) {
        x_sum += x[i];
        y_sum += y[i];
    }

    double x_mean = x_sum/n;
    double y_mean = y_sum/n;

    // find m and b
    double mNum = 0, mDenum = 0;

    for (int i = 0; i < n; ++i) {
        mNum += (x[i]-x_mean)*(y[i]-y_mean);
        mDenum += (x[i]-x_mean)*(x[i]-x_mean);
    }

    (*m) = mNum/mDenum;
    (*b) = y_mean-(*m)*x_mean;
} 


int main() {

    // simple example of
    // y = 2*x + 3 with noise added

    int n = 10; 

    double x[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    double y[10] = {3.2, 4.9, 6.8, 9.1, 11.3, 12.7, 14.8, 17.2, 19.4, 21.1};

    double m, b;

    linearRegression(x, y, n, &m, &b);

    // calculate R-Squared
    double rSquared = calculateRSquared(x, y, n, m, b);

    printf("m: %f, b: %f, R^2: %f\n", m, b, rSquared);

    return 0;
}