Public Class frmPayment
    Private Sub btnPay_Click(sender As Object, e As EventArgs) Handles btnPay.Click
        ' Cardholder name, card number, expiry date and CVV 
        ' must be filled in order to complete payment.

        If cboPayment.Text = "" Then
            Return
        End If

        If txtCardholderName.Text = "" Then
            Return
        End If

        If txtCardNumber.Text = "" Then
            Return
        End If

        If txtExpiryDate.Text = "" Then
            Return
        End If

        If txtCVV.Text = "" Then
            Return
        End If

        ' Message box appears when the textboxes are
        ' filled in and the button is clicked.
        MsgBox("Payment Successful!")
    End Sub
End Class