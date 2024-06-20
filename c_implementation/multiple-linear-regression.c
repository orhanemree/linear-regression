#include <stdio.h>


// multiple linear regression example
// with two (x and y) input variables
// z = y + x

// Note: i will implement the actaul function soon.
// it seems a bit harder when we don't know how much
// input variables we have :)


int n = 5;
double X[5] = {0, 1, 2, 3, 4};
double Y[5] = {25, 10, 8, 9, 30};
double Z[5] = {25, 11, 10, 12, 34}; // z = x + y


int main() {

    double b0 = 0.01, b1= 0.01, b2 = 0.01;
    double L = 0.001;
    double dB0, dB1, dB2;
    int epochs = 10000;

    // z = b0 + b1*x + b2*y

    for (int k = 0; k < epochs; ++k) {

        dB0 = 0;
        dB1 = 0;
        dB2 = 0;

        for (int i = 0; i < n; ++i) {

            // partial derivative of cost

            // respect to b0
            dB0 += 2*((b0 + b1*X[i] + b2*Y[i])-Z[i]);

            // respect to b1
            dB1 += 2*((b0 + b1*X[i] + b2*Y[i])-Z[i])*(X[i]);

            // respect to b2
            dB2 += 2*((b0 + b1*X[i] + b2*Y[i])-Z[i])*(Y[i]);
        }

        dB0 /= n;
        dB1 /= n;
        dB2 /= n;

        // update coefficients
        b0 = b0 - (L*dB0);
        b1 = b1 - (L*dB1);
        b2 = b2 - (L*dB2);
    }

    printf("b0: %f, b1: %f, b2: %f\n", b0, b1, b2);

    return 0;
}