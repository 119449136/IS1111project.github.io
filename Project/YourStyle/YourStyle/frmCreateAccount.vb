Public Class frmCreateAccount
    Private Sub btnSubmit_Click(sender As Object, e As EventArgs) Handles btnSubmit.Click
        ' If the textboxes are blank, the next form won't open.
        If txtFirstName.Text = "" Then
            Return
        End If

        If txtLastName.Text = "" Then
            Return
        End If

        If txtDate.Text = "" Then
            Return
        End If

        If txtEmail.Text = "" Then
            Return
        End If

        If txtPassword.Text = "" Then
            Return
        End If

        If txtTelephone.Text = "" Then
            Return
        End If

        If txtAddress.Text = "" Then
            Return
        End If

        ' This form closes then next form opens.
        Me.Hide()
    End Sub
End Class