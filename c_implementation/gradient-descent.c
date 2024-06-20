#include <stdio.h>
#include "score-error-cost.c"


// linear regression implementation with gradient descent method
// and a simple example


void gradientDescent(double x[], double y[], int n, double *m, double *b,
    int epochs
    ) {

    // x: array of x independent
    // y: array of y dependent
    // n: length of x and y arrays
    // m: m of y = m*x+b updated in-place
    // b: b of y = m*x+b updated in-place
    // epochs: number of iterations

    // default valuables for m and b
    double m_ = 0.001; 
    double b_ = 0.001; // why not?


    // learning rate
    double L = 0.001; // why not?

    double dM, dB;

    // repeat until perfect
    for (int k = 0; k < epochs; ++k) {

        dM = 0;
        dB = 0;

        // partial derivative of cost
        for (int i = 0; i < n; ++i) {
            // respect to m
            dM += 2*(m_*x[i]+b_ - y[i])*(x[i]);

            // respect to b
            dB += 2*(m_*x[i]+b_ - y[i]);
        }

        dM /= n;
        dB /= n;

        m_ = m_ - (L * dM);
        b_ = b_ - (L * dB);
    }

    *m = m_;
    *b = b_;
}


int main() {

    // simple example of
    // y = 2*x + 3 with noise added

    int n = 10; 

    double x[10] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    double y[10] = {3.2, 4.9, 6.8, 9.1, 11.3, 12.7, 14.8, 17.2, 19.4, 21.1};

    double m, b;

    gradientDescent(x, y, n, &m, &b, 10000);

    // calculate R-Squared
    double rSquared = calculateRSquared(x, y, n, m, b);

    printf("m: %f, b: %f, R^2: %f\n", m, b, rSquared);

    return 0;
}