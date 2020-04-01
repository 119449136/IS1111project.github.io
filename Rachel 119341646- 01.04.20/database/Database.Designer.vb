<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()>
Partial Class frmDatabase
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()>
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()>
    Private Sub InitializeComponent()
        Me.components = New System.ComponentModel.Container()
        Me.BindingSource1 = New System.Windows.Forms.BindingSource(Me.components)
        Me.IS1111databaseDataSet = New database.IS1111databaseDataSet()
        Me.dgvOutput = New System.Windows.Forms.DataGridView()
        Me.Customer_DetailsTableAdapter1 = New database.IS1111databaseDataSetTableAdapters.Customer_DetailsTableAdapter()
        Me.lstCustomer = New System.Windows.Forms.ListBox()
        Me.btnDisplay = New System.Windows.Forms.Button()
        CType(Me.BindingSource1, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.IS1111databaseDataSet, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.dgvOutput, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'BindingSource1
        '
        Me.BindingSource1.DataSource = Me.IS1111databaseDataSet
        Me.BindingSource1.Position = 0
        '
        'IS1111databaseDataSet
        '
        Me.IS1111databaseDataSet.DataSetName = "IS1111databaseDataSet"
        Me.IS1111databaseDataSet.SchemaSerializationMode = System.Data.SchemaSerializationMode.IncludeSchema
        '
        'dgvOutput
        '
        Me.dgvOutput.AutoGenerateColumns = False
        Me.dgvOutput.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize
        Me.dgvOutput.DataSource = Me.BindingSource1
        Me.dgvOutput.Location = New System.Drawing.Point(358, 34)
        Me.dgvOutput.Name = "dgvOutput"
        Me.dgvOutput.RowTemplate.Height = 28
        Me.dgvOutput.Size = New System.Drawing.Size(292, 156)
        Me.dgvOutput.TabIndex = 0
        '
        'Customer_DetailsTableAdapter1
        '
        Me.Customer_DetailsTableAdapter1.ClearBeforeFill = True
        '
        'lstCustomer
        '
        Me.lstCustomer.FormattingEnabled = True
        Me.lstCustomer.ItemHeight = 20
        Me.lstCustomer.Location = New System.Drawing.Point(151, 34)
        Me.lstCustomer.Name = "lstCustomer"
        Me.lstCustomer.Size = New System.Drawing.Size(131, 164)
        Me.lstCustomer.TabIndex = 1
        '
        'btnDisplay
        '
        Me.btnDisplay.Location = New System.Drawing.Point(151, 218)
        Me.btnDisplay.Name = "btnDisplay"
        Me.btnDisplay.Size = New System.Drawing.Size(131, 33)
        Me.btnDisplay.TabIndex = 2
        Me.btnDisplay.Text = "Display"
        Me.btnDisplay.UseVisualStyleBackColor = True
        '
        'frmDatabase
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(9.0!, 20.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(800, 450)
        Me.Controls.Add(Me.btnDisplay)
        Me.Controls.Add(Me.lstCustomer)
        Me.Controls.Add(Me.dgvOutput)
        Me.Name = "frmDatabase"
        Me.Text = "Form1"
        CType(Me.BindingSource1, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.IS1111databaseDataSet, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.dgvOutput, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)

    End Sub

    Friend WithEvents BindingSource1 As BindingSource
    Friend WithEvents IS1111databaseDataSet As IS1111databaseDataSet
    Friend WithEvents dgvOutput As DataGridView
    Friend WithEvents Customer_DetailsTableAdapter1 As IS1111databaseDataSetTableAdapters.Customer_DetailsTableAdapter
    Friend WithEvents lstCustomer As ListBox
    Friend WithEvents btnDisplay As Button
End Class
