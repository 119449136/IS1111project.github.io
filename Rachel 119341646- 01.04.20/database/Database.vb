Public Class frmDatabase
    Private Sub dgvOutput_CellContentClick(sender As Object, e As DataGridViewCellEventArgs) Handles dgvOutput.CellContentClick
        ' Me.Customer_DetailsTableAdapter1.Fill(Me.IS1111databaseDataSet).Customer
    End Sub

    Private Sub frmDatabase_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        'Me.Customer_DetailsTableAdapter1.Fill(Me.IS1111databaseDataSet).Customer
    End Sub

    Private Sub lstCustomer_SelectedIndexChanged(sender As Object, e As EventArgs) Handles lstCustomer.SelectedIndexChanged
        lstCustomer.Items.Add(Customer_DetailsTableAdapter1)
    End Sub

    Private Sub btnDisplay_Click(sender As Object, e As EventArgs) Handles btnDisplay.Click
        lstCustomer.Items.Add(Customer_DetailsTableAdapter1)
    End Sub
End Class
