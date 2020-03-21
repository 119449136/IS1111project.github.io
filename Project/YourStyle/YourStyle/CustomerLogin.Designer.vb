<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmCustomerLogin
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
        Me.grpWelcome = New System.Windows.Forms.GroupBox()
        Me.btnLogin = New System.Windows.Forms.Button()
        Me.txtPassword = New System.Windows.Forms.TextBox()
        Me.lblPassword = New System.Windows.Forms.Label()
        Me.txtEmail = New System.Windows.Forms.TextBox()
        Me.lblEmail = New System.Windows.Forms.Label()
        Me.lblWelcome = New System.Windows.Forms.Label()
        Me.grpCreate = New System.Windows.Forms.GroupBox()
        Me.lblCreate = New System.Windows.Forms.Label()
        Me.btnCreate = New System.Windows.Forms.Button()
        Me.grpWelcome.SuspendLayout()
        Me.grpCreate.SuspendLayout()
        Me.SuspendLayout()
        '
        'grpWelcome
        '
        Me.grpWelcome.BackColor = System.Drawing.Color.White
        Me.grpWelcome.Controls.Add(Me.btnLogin)
        Me.grpWelcome.Controls.Add(Me.txtPassword)
        Me.grpWelcome.Controls.Add(Me.lblPassword)
        Me.grpWelcome.Controls.Add(Me.txtEmail)
        Me.grpWelcome.Controls.Add(Me.lblEmail)
        Me.grpWelcome.Controls.Add(Me.lblWelcome)
        Me.grpWelcome.Location = New System.Drawing.Point(12, 12)
        Me.grpWelcome.Name = "grpWelcome"
        Me.grpWelcome.Size = New System.Drawing.Size(258, 190)
        Me.grpWelcome.TabIndex = 0
        Me.grpWelcome.TabStop = False
        '
        'btnLogin
        '
        Me.btnLogin.Font = New System.Drawing.Font("Century Gothic", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btnLogin.Location = New System.Drawing.Point(10, 146)
        Me.btnLogin.Name = "btnLogin"
        Me.btnLogin.Size = New System.Drawing.Size(75, 29)
        Me.btnLogin.TabIndex = 5
        Me.btnLogin.Text = "&Login"
        Me.btnLogin.UseVisualStyleBackColor = True
        '
        'txtPassword
        '
        Me.txtPassword.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtPassword.Location = New System.Drawing.Point(10, 118)
        Me.txtPassword.Name = "txtPassword"
        Me.txtPassword.Size = New System.Drawing.Size(167, 22)
        Me.txtPassword.TabIndex = 4
        Me.txtPassword.UseSystemPasswordChar = True
        '
        'lblPassword
        '
        Me.lblPassword.AutoSize = True
        Me.lblPassword.Font = New System.Drawing.Font("Century Gothic", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblPassword.Location = New System.Drawing.Point(7, 98)
        Me.lblPassword.Name = "lblPassword"
        Me.lblPassword.Size = New System.Drawing.Size(73, 17)
        Me.lblPassword.TabIndex = 3
        Me.lblPassword.Text = "Password:"
        '
        'txtEmail
        '
        Me.txtEmail.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtEmail.Location = New System.Drawing.Point(9, 73)
        Me.txtEmail.Name = "txtEmail"
        Me.txtEmail.Size = New System.Drawing.Size(168, 22)
        Me.txtEmail.TabIndex = 2
        '
        'lblEmail
        '
        Me.lblEmail.AutoSize = True
        Me.lblEmail.Font = New System.Drawing.Font("Century Gothic", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblEmail.Location = New System.Drawing.Point(6, 53)
        Me.lblEmail.Name = "lblEmail"
        Me.lblEmail.Size = New System.Drawing.Size(100, 17)
        Me.lblEmail.TabIndex = 1
        Me.lblEmail.Text = "Email Address:"
        '
        'lblWelcome
        '
        Me.lblWelcome.AutoSize = True
        Me.lblWelcome.Font = New System.Drawing.Font("Century Gothic", 15.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblWelcome.Location = New System.Drawing.Point(6, 16)
        Me.lblWelcome.Name = "lblWelcome"
        Me.lblWelcome.Size = New System.Drawing.Size(171, 25)
        Me.lblWelcome.TabIndex = 0
        Me.lblWelcome.Text = "Welcome Back!"
        '
        'grpCreate
        '
        Me.grpCreate.Controls.Add(Me.btnCreate)
        Me.grpCreate.Controls.Add(Me.lblCreate)
        Me.grpCreate.Location = New System.Drawing.Point(276, 12)
        Me.grpCreate.Name = "grpCreate"
        Me.grpCreate.Size = New System.Drawing.Size(258, 95)
        Me.grpCreate.TabIndex = 1
        Me.grpCreate.TabStop = False
        '
        'lblCreate
        '
        Me.lblCreate.AutoSize = True
        Me.lblCreate.Font = New System.Drawing.Font("Century Gothic", 14.25!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCreate.Location = New System.Drawing.Point(6, 17)
        Me.lblCreate.Name = "lblCreate"
        Me.lblCreate.Size = New System.Drawing.Size(234, 23)
        Me.lblCreate.TabIndex = 1
        Me.lblCreate.Text = "Don't Have An Account?"
        '
        'btnCreate
        '
        Me.btnCreate.Font = New System.Drawing.Font("Century Gothic", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btnCreate.Location = New System.Drawing.Point(27, 53)
        Me.btnCreate.Name = "btnCreate"
        Me.btnCreate.Size = New System.Drawing.Size(202, 30)
        Me.btnCreate.TabIndex = 2
        Me.btnCreate.Text = "&Create An Account"
        Me.btnCreate.UseVisualStyleBackColor = True
        '
        'frmCustomerLogin
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.BackColor = System.Drawing.Color.White
        Me.ClientSize = New System.Drawing.Size(601, 210)
        Me.Controls.Add(Me.grpCreate)
        Me.Controls.Add(Me.grpWelcome)
        Me.Name = "frmCustomerLogin"
        Me.Text = "Customer Login"
        Me.grpWelcome.ResumeLayout(False)
        Me.grpWelcome.PerformLayout()
        Me.grpCreate.ResumeLayout(False)
        Me.grpCreate.PerformLayout()
        Me.ResumeLayout(False)

    End Sub

    Friend WithEvents grpWelcome As GroupBox
    Friend WithEvents btnLogin As Button
    Friend WithEvents txtPassword As TextBox
    Friend WithEvents lblPassword As Label
    Friend WithEvents txtEmail As TextBox
    Friend WithEvents lblEmail As Label
    Friend WithEvents lblWelcome As Label
    Friend WithEvents grpCreate As GroupBox
    Friend WithEvents btnCreate As Button
    Friend WithEvents lblCreate As Label
End Class
