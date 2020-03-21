' Project Name: Your Style
' Project Developers: Sarah O'Connell (119458804), Timmie Hennessy (119449136),
' Rachel O 'Donovan (119341646), Ronan Wall (119370093)
' Group Number: 32
' Date: March 2020
' Description: This program acts as an Ordering Management System. The Graphical 
' User Interface is designed to allow customers and staff members to enter 
' information via a PC. All data entered into the system is stored in an Access
' Database. The employee can view the customer information and respond to 
' customer queries relationg to the status of their order. They can also add and
' update records. The manager can run queries, print off reports and has full
' control of the system.

Public Class frmSelectUser
    Private Sub btnStaff_Click(sender As Object, e As EventArgs) Handles btnStaff.Click
        ' Start by leaving the employee number blank.
        Dim strEmployeeNumber As String = ""

        ' The loop keeps repeating while the student number does not equal 123456.
        Do While strEmployeeNumber <> "123456"
            ' Each time the employee number does not equal to 12345,
            ' the inputbox reappears.
            strEmployeeNumber = InputBox("Please enter employee number.")
        Loop

        ' Start by leaving the password blank.
        Dim strPassword As String = ""

        ' The loop keeps repeating while the password does not equal ilovevb.
        Do While strPassword <> "ilovevb"
            ' Each time the password does not equal ilovevb,
            ' the inputbox reappears.
            strPassword = InputBox("Please enter password.")
        Loop
        MsgBox("You have been successfully logged in!")

        ' If the button is clicked, the current form will close
        Me.Hide()
    End Sub

    Private Sub btnCustomer_Click(sender As Object, e As EventArgs) Handles btnCustomer.Click
        ' If the button is clicked, the current form will close and
        ' the next form will open.
        Me.Hide()
        frmCustomerLogin.Show()
    End Sub
End Class
