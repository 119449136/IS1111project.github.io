Public Class frmLogin
    Private Sub btnLogin_Click(sender As Object, e As EventArgs) Handles btnLogin.Click
        'Declar our Variables
        Dim strUsername, strPassword As String
        'If btnCustomer_Click() Then
        'Assigning Values to our variables


        If rdoEmployee.Checked = True Then
            strUsername = "Worker100"
            strPassword = "Bis2020"
            'Including nested if statements to Login
            If txtUsername.Text = strUsername And txtPassword.Text = strPassword Then
                Me.Hide()
                'frmBestfriends1.Show()
                'If password correct
                MessageBox.Show("Well done, you're in the system!!", "Login")
            Else
                'If password not correct
                MessageBox.Show("Error, Try Again")
            End If
        End If
        If rdoManager.Checked = True Then
            strUsername = "Manager100"
            strPassword = "Manager2020"
            'Including nested if statements to Login
            If txtUsername.Text = strUsername And txtPassword.Text = strPassword Then
                Me.Hide()
                'frmBestfriends1.Show()
                'If password correct
                MessageBox.Show("Well done, you're in the system!!", "Login")
            Else
                'If password not correct
                MessageBox.Show("Error, Try Again")
            End If
        End If
    End Sub

    Private Sub btnConfirm_Click(sender As Object, e As EventArgs) Handles btnConfirm.Click
        If rdoCustomer.Checked = True Then
            Me.Hide()
            frmYourstyle.Show()

        End If

        If rdoEmployee.Checked = True Then
            lblUsername.Visible = True
            txtUsername.Visible = True
            lblPassword.Visible = True
            txtPassword.Visible = True
            btnLogin.Visible = True
        End If

        If rdoManager.Checked = True Then
            lblUsername.Visible = True
            txtUsername.Visible = True
            lblPassword.Visible = True
            txtPassword.Visible = True
            btnLogin.Visible = True
        End If
    End Sub
End Class



