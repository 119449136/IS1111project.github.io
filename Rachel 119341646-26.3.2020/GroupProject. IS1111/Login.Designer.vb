<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmLogin
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
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
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.lblYourstyle = New System.Windows.Forms.Label()
        Me.lblUsername = New System.Windows.Forms.Label()
        Me.lblPassword = New System.Windows.Forms.Label()
        Me.txtUsername = New System.Windows.Forms.TextBox()
        Me.txtPassword = New System.Windows.Forms.TextBox()
        Me.btnLogin = New System.Windows.Forms.Button()
        Me.grpSelect = New System.Windows.Forms.GroupBox()
        Me.rdoCustomer = New System.Windows.Forms.RadioButton()
        Me.rdoEmployee = New System.Windows.Forms.RadioButton()
        Me.rdoManager = New System.Windows.Forms.RadioButton()
        Me.btnConfirm = New System.Windows.Forms.Button()
        Me.grpSelect.SuspendLayout()
        Me.SuspendLayout()
        '
        'lblYourstyle
        '
        Me.lblYourstyle.AutoSize = True
        Me.lblYourstyle.Font = New System.Drawing.Font("Script MT Bold", 18.0!, CType((System.Drawing.FontStyle.Bold Or System.Drawing.FontStyle.Underline), System.Drawing.FontStyle), System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblYourstyle.ForeColor = System.Drawing.Color.FromArgb(CType(CType(192, Byte), Integer), CType(CType(0, Byte), Integer), CType(CType(0, Byte), Integer))
        Me.lblYourstyle.Location = New System.Drawing.Point(314, 33)
        Me.lblYourstyle.Name = "lblYourstyle"
        Me.lblYourstyle.Size = New System.Drawing.Size(177, 43)
        Me.lblYourstyle.TabIndex = 0
        Me.lblYourstyle.Text = "Your Style"
        '
        'lblUsername
        '
        Me.lblUsername.AutoSize = True
        Me.lblUsername.Location = New System.Drawing.Point(221, 305)
        Me.lblUsername.Name = "lblUsername"
        Me.lblUsername.Size = New System.Drawing.Size(87, 20)
        Me.lblUsername.TabIndex = 4
        Me.lblUsername.Text = "Username:"
        Me.lblUsername.Visible = False
        '
        'lblPassword
        '
        Me.lblPassword.AutoSize = True
        Me.lblPassword.Location = New System.Drawing.Point(226, 350)
        Me.lblPassword.Name = "lblPassword"
        Me.lblPassword.Size = New System.Drawing.Size(82, 20)
        Me.lblPassword.TabIndex = 5
        Me.lblPassword.Text = "Password:"
        Me.lblPassword.Visible = False
        '
        'txtUsername
        '
        Me.txtUsername.Location = New System.Drawing.Point(341, 305)
        Me.txtUsername.Name = "txtUsername"
        Me.txtUsername.Size = New System.Drawing.Size(119, 26)
        Me.txtUsername.TabIndex = 6
        Me.txtUsername.Visible = False
        '
        'txtPassword
        '
        Me.txtPassword.Location = New System.Drawing.Point(341, 350)
        Me.txtPassword.Name = "txtPassword"
        Me.txtPassword.Size = New System.Drawing.Size(119, 26)
        Me.txtPassword.TabIndex = 7
        Me.txtPassword.Visible = False
        '
        'btnLogin
        '
        Me.btnLogin.Location = New System.Drawing.Point(341, 382)
        Me.btnLogin.Name = "btnLogin"
        Me.btnLogin.Size = New System.Drawing.Size(119, 43)
        Me.btnLogin.TabIndex = 8
        Me.btnLogin.Text = "Login"
        Me.btnLogin.UseVisualStyleBackColor = True
        Me.btnLogin.Visible = False
        '
        'grpSelect
        '
        Me.grpSelect.Controls.Add(Me.rdoManager)
        Me.grpSelect.Controls.Add(Me.rdoEmployee)
        Me.grpSelect.Controls.Add(Me.rdoCustomer)
        Me.grpSelect.Location = New System.Drawing.Point(60, 232)
        Me.grpSelect.Name = "grpSelect"
        Me.grpSelect.Size = New System.Drawing.Size(400, 58)
        Me.grpSelect.TabIndex = 13
        Me.grpSelect.TabStop = False
        Me.grpSelect.Text = "Select Option:"
        '
        'rdoCustomer
        '
        Me.rdoCustomer.AutoSize = True
        Me.rdoCustomer.Location = New System.Drawing.Point(11, 25)
        Me.rdoCustomer.Name = "rdoCustomer"
        Me.rdoCustomer.Size = New System.Drawing.Size(103, 24)
        Me.rdoCustomer.TabIndex = 0
        Me.rdoCustomer.TabStop = True
        Me.rdoCustomer.Text = "Customer"
        Me.rdoCustomer.UseVisualStyleBackColor = True
        '
        'rdoEmployee
        '
        Me.rdoEmployee.AutoSize = True
        Me.rdoEmployee.Location = New System.Drawing.Point(144, 25)
        Me.rdoEmployee.Name = "rdoEmployee"
        Me.rdoEmployee.Size = New System.Drawing.Size(104, 24)
        Me.rdoEmployee.TabIndex = 1
        Me.rdoEmployee.TabStop = True
        Me.rdoEmployee.Text = "Employee"
        Me.rdoEmployee.UseVisualStyleBackColor = True
        '
        'rdoManager
        '
        Me.rdoManager.AutoSize = True
        Me.rdoManager.Location = New System.Drawing.Point(281, 25)
        Me.rdoManager.Name = "rdoManager"
        Me.rdoManager.Size = New System.Drawing.Size(97, 24)
        Me.rdoManager.TabIndex = 2
        Me.rdoManager.TabStop = True
        Me.rdoManager.Text = "Manager"
        Me.rdoManager.UseVisualStyleBackColor = True
        '
        'btnConfirm
        '
        Me.btnConfirm.Location = New System.Drawing.Point(474, 232)
        Me.btnConfirm.Name = "btnConfirm"
        Me.btnConfirm.Size = New System.Drawing.Size(110, 58)
        Me.btnConfirm.TabIndex = 14
        Me.btnConfirm.Text = "Confirm"
        Me.btnConfirm.UseVisualStyleBackColor = True
        '
        'frmLogin
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(9.0!, 20.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(800, 450)
        Me.Controls.Add(Me.btnConfirm)
        Me.Controls.Add(Me.grpSelect)
        Me.Controls.Add(Me.btnLogin)
        Me.Controls.Add(Me.txtPassword)
        Me.Controls.Add(Me.txtUsername)
        Me.Controls.Add(Me.lblPassword)
        Me.Controls.Add(Me.lblUsername)
        Me.Controls.Add(Me.lblYourstyle)
        Me.Name = "frmLogin"
        Me.Text = "Login"
        Me.grpSelect.ResumeLayout(False)
        Me.grpSelect.PerformLayout()
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub

    Friend WithEvents lblYourstyle As Label
    Friend WithEvents lblUsername As Label
    Friend WithEvents lblPassword As Label
    Friend WithEvents txtUsername As TextBox
    Friend WithEvents txtPassword As TextBox
    Friend WithEvents btnLogin As Button
    Friend WithEvents grpSelect As GroupBox
    Friend WithEvents rdoManager As RadioButton
    Friend WithEvents rdoEmployee As RadioButton
    Friend WithEvents rdoCustomer As RadioButton
    Friend WithEvents btnConfirm As Button
End Class
