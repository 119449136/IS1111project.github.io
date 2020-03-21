<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmPayment
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
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(frmPayment))
        Me.picPayment = New System.Windows.Forms.PictureBox()
        Me.lblPaymentType = New System.Windows.Forms.Label()
        Me.cboPayment = New System.Windows.Forms.ComboBox()
        Me.lblCardholderName = New System.Windows.Forms.Label()
        Me.lblCardNumber = New System.Windows.Forms.Label()
        Me.lblExpiryDate = New System.Windows.Forms.Label()
        Me.lblCVV = New System.Windows.Forms.Label()
        Me.btnPay = New System.Windows.Forms.Button()
        Me.grpPayment = New System.Windows.Forms.GroupBox()
        Me.txtExpiryDate = New System.Windows.Forms.MaskedTextBox()
        Me.txtCVV = New System.Windows.Forms.MaskedTextBox()
        Me.txtCardNumber = New System.Windows.Forms.MaskedTextBox()
        Me.txtCardholderName = New System.Windows.Forms.TextBox()
        CType(Me.picPayment, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.grpPayment.SuspendLayout()
        Me.SuspendLayout()
        '
        'picPayment
        '
        Me.picPayment.Image = CType(resources.GetObject("picPayment.Image"), System.Drawing.Image)
        Me.picPayment.Location = New System.Drawing.Point(6, 24)
        Me.picPayment.Name = "picPayment"
        Me.picPayment.Size = New System.Drawing.Size(250, 71)
        Me.picPayment.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage
        Me.picPayment.TabIndex = 0
        Me.picPayment.TabStop = False
        '
        'lblPaymentType
        '
        Me.lblPaymentType.AutoSize = True
        Me.lblPaymentType.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblPaymentType.Location = New System.Drawing.Point(6, 107)
        Me.lblPaymentType.Name = "lblPaymentType"
        Me.lblPaymentType.Size = New System.Drawing.Size(135, 17)
        Me.lblPaymentType.TabIndex = 1
        Me.lblPaymentType.Text = "Select Payment Type:"
        '
        'cboPayment
        '
        Me.cboPayment.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.cboPayment.FormattingEnabled = True
        Me.cboPayment.Items.AddRange(New Object() {"Mastercard", "Visa", "PayPal", "Google Pay", "Apple Pay", "Revolut"})
        Me.cboPayment.Location = New System.Drawing.Point(6, 127)
        Me.cboPayment.Name = "cboPayment"
        Me.cboPayment.Size = New System.Drawing.Size(135, 25)
        Me.cboPayment.TabIndex = 2
        '
        'lblCardholderName
        '
        Me.lblCardholderName.AutoSize = True
        Me.lblCardholderName.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCardholderName.Location = New System.Drawing.Point(6, 155)
        Me.lblCardholderName.Name = "lblCardholderName"
        Me.lblCardholderName.Size = New System.Drawing.Size(117, 17)
        Me.lblCardholderName.TabIndex = 3
        Me.lblCardholderName.Text = "Cardholder Name:"
        '
        'lblCardNumber
        '
        Me.lblCardNumber.AutoSize = True
        Me.lblCardNumber.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCardNumber.Location = New System.Drawing.Point(6, 200)
        Me.lblCardNumber.Name = "lblCardNumber"
        Me.lblCardNumber.Size = New System.Drawing.Size(90, 17)
        Me.lblCardNumber.TabIndex = 5
        Me.lblCardNumber.Text = "Card Number:"
        '
        'lblExpiryDate
        '
        Me.lblExpiryDate.AutoSize = True
        Me.lblExpiryDate.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblExpiryDate.Location = New System.Drawing.Point(3, 245)
        Me.lblExpiryDate.Name = "lblExpiryDate"
        Me.lblExpiryDate.Size = New System.Drawing.Size(77, 17)
        Me.lblExpiryDate.TabIndex = 7
        Me.lblExpiryDate.Text = "Expiry Date:"
        '
        'lblCVV
        '
        Me.lblCVV.AutoSize = True
        Me.lblCVV.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblCVV.Location = New System.Drawing.Point(86, 246)
        Me.lblCVV.Name = "lblCVV"
        Me.lblCVV.Size = New System.Drawing.Size(38, 17)
        Me.lblCVV.TabIndex = 8
        Me.lblCVV.Text = "CVV:"
        '
        'btnPay
        '
        Me.btnPay.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btnPay.Location = New System.Drawing.Point(6, 293)
        Me.btnPay.Name = "btnPay"
        Me.btnPay.Size = New System.Drawing.Size(250, 29)
        Me.btnPay.TabIndex = 9
        Me.btnPay.Text = "&Pay Now"
        Me.btnPay.UseVisualStyleBackColor = True
        '
        'grpPayment
        '
        Me.grpPayment.Controls.Add(Me.txtCardholderName)
        Me.grpPayment.Controls.Add(Me.txtCardNumber)
        Me.grpPayment.Controls.Add(Me.txtCVV)
        Me.grpPayment.Controls.Add(Me.txtExpiryDate)
        Me.grpPayment.Controls.Add(Me.picPayment)
        Me.grpPayment.Controls.Add(Me.btnPay)
        Me.grpPayment.Controls.Add(Me.lblPaymentType)
        Me.grpPayment.Controls.Add(Me.lblCVV)
        Me.grpPayment.Controls.Add(Me.cboPayment)
        Me.grpPayment.Controls.Add(Me.lblExpiryDate)
        Me.grpPayment.Controls.Add(Me.lblCardholderName)
        Me.grpPayment.Controls.Add(Me.lblCardNumber)
        Me.grpPayment.Font = New System.Drawing.Font("Century Gothic", 9.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpPayment.Location = New System.Drawing.Point(12, 12)
        Me.grpPayment.Name = "grpPayment"
        Me.grpPayment.Size = New System.Drawing.Size(262, 332)
        Me.grpPayment.TabIndex = 10
        Me.grpPayment.TabStop = False
        Me.grpPayment.Text = "Secure Card Payment:"
        '
        'txtExpiryDate
        '
        Me.txtExpiryDate.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtExpiryDate.Location = New System.Drawing.Point(6, 266)
        Me.txtExpiryDate.Mask = "00/00"
        Me.txtExpiryDate.Name = "txtExpiryDate"
        Me.txtExpiryDate.Size = New System.Drawing.Size(45, 22)
        Me.txtExpiryDate.TabIndex = 13
        '
        'txtCVV
        '
        Me.txtCVV.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtCVV.Location = New System.Drawing.Point(89, 265)
        Me.txtCVV.Mask = "000"
        Me.txtCVV.Name = "txtCVV"
        Me.txtCVV.Size = New System.Drawing.Size(35, 22)
        Me.txtCVV.TabIndex = 14
        '
        'txtCardNumber
        '
        Me.txtCardNumber.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtCardNumber.Location = New System.Drawing.Point(7, 221)
        Me.txtCardNumber.Mask = "0000 0000 0000 0000"
        Me.txtCardNumber.Name = "txtCardNumber"
        Me.txtCardNumber.Size = New System.Drawing.Size(134, 22)
        Me.txtCardNumber.TabIndex = 15
        '
        'txtCardholderName
        '
        Me.txtCardholderName.Font = New System.Drawing.Font("Century Gothic", 9.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.txtCardholderName.Location = New System.Drawing.Point(7, 176)
        Me.txtCardholderName.Name = "txtCardholderName"
        Me.txtCardholderName.Size = New System.Drawing.Size(134, 22)
        Me.txtCardholderName.TabIndex = 16
        '
        'frmPayment
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.BackColor = System.Drawing.Color.White
        Me.ClientSize = New System.Drawing.Size(286, 353)
        Me.Controls.Add(Me.grpPayment)
        Me.Name = "frmPayment"
        Me.Text = "Payment"
        CType(Me.picPayment, System.ComponentModel.ISupportInitialize).EndInit()
        Me.grpPayment.ResumeLayout(False)
        Me.grpPayment.PerformLayout()
        Me.ResumeLayout(False)

    End Sub

    Friend WithEvents picPayment As PictureBox
    Friend WithEvents lblPaymentType As Label
    Friend WithEvents cboPayment As ComboBox
    Friend WithEvents lblCardholderName As Label
    Friend WithEvents lblCardNumber As Label
    Friend WithEvents lblExpiryDate As Label
    Friend WithEvents lblCVV As Label
    Friend WithEvents btnPay As Button
    Friend WithEvents grpPayment As GroupBox
    Friend WithEvents txtCardholderName As TextBox
    Friend WithEvents txtCardNumber As MaskedTextBox
    Friend WithEvents txtCVV As MaskedTextBox
    Friend WithEvents txtExpiryDate As MaskedTextBox
End Class
