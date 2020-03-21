Public Class frmCustomerLogin
    Private Sub btnLogin_Click(sender As Object, e As EventArgs) Handles btnLogin.Click
        ' If the textboxes are empty, the next form won't open.
        If txtEmail.Text = "" Then
            Return
        End If

        If txtPassword.Text = "" Then
            Return
        End If

        ' Current form closes, next form opens.
        Me.Hide()
    End Sub

    Private Sub btnCreate_Click(sender As Object, e As EventArgs) Handles btnCreate.Click
        ' If the button is clicked, the current form will close and
        ' the next form will open.
        Me.Hide()
        frmCreateAccount.Show()
    End Sub
End Class