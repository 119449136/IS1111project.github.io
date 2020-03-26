<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmYourstyle
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
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(frmYourstyle))
        Me.rdoClassic = New System.Windows.Forms.RadioButton()
        Me.rdoRetro = New System.Windows.Forms.RadioButton()
        Me.rdoVintage = New System.Windows.Forms.RadioButton()
        Me.GroupBox1 = New System.Windows.Forms.GroupBox()
        Me.btnNext = New System.Windows.Forms.Button()
        Me.lblShoe = New System.Windows.Forms.Label()
        Me.grpCustimisation = New System.Windows.Forms.GroupBox()
        Me.lblIfcolourwhite = New System.Windows.Forms.Label()
        Me.txtText = New System.Windows.Forms.TextBox()
        Me.chkText = New System.Windows.Forms.CheckBox()
        Me.picHeart = New System.Windows.Forms.PictureBox()
        Me.picFootball = New System.Windows.Forms.PictureBox()
        Me.picStar = New System.Windows.Forms.PictureBox()
        Me.picFlower = New System.Windows.Forms.PictureBox()
        Me.picFlame = New System.Windows.Forms.PictureBox()
        Me.cmbLogo = New System.Windows.Forms.ComboBox()
        Me.chkLogo = New System.Windows.Forms.CheckBox()
        Me.cmbLaces = New System.Windows.Forms.ComboBox()
        Me.cmbEyestay = New System.Windows.Forms.ComboBox()
        Me.cmbHeeltab = New System.Windows.Forms.ComboBox()
        Me.cmbHeelback = New System.Windows.Forms.ComboBox()
        Me.cmbColourvamp = New System.Windows.Forms.ComboBox()
        Me.chkLaces = New System.Windows.Forms.CheckBox()
        Me.chkHeelback = New System.Windows.Forms.CheckBox()
        Me.chkHeeltab = New System.Windows.Forms.CheckBox()
        Me.chkEyestay = New System.Windows.Forms.CheckBox()
        Me.chkVamp = New System.Windows.Forms.CheckBox()
        Me.btnProceed = New System.Windows.Forms.Button()
        Me.cmbColour1 = New System.Windows.Forms.ComboBox()
        Me.chkQuarter = New System.Windows.Forms.CheckBox()
        Me.txtSum = New System.Windows.Forms.TextBox()
        Me.btnDisplay = New System.Windows.Forms.Button()
        Me.lblPrice = New System.Windows.Forms.Label()
        Me.picClassic = New System.Windows.Forms.PictureBox()
        Me.picRetro = New System.Windows.Forms.PictureBox()
        Me.picVintage = New System.Windows.Forms.PictureBox()
        Me.lblPricevat = New System.Windows.Forms.Label()
        Me.txtPricevat = New System.Windows.Forms.TextBox()
        Me.btnDisplayprice = New System.Windows.Forms.Button()
        Me.GroupBox1.SuspendLayout()
        Me.grpCustimisation.SuspendLayout()
        CType(Me.picHeart, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picFootball, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picStar, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picFlower, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picFlame, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picClassic, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picRetro, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.picVintage, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'rdoClassic
        '
        Me.rdoClassic.AutoSize = True
        Me.rdoClassic.Location = New System.Drawing.Point(20, 34)
        Me.rdoClassic.Name = "rdoClassic"
        Me.rdoClassic.Size = New System.Drawing.Size(180, 29)
        Me.rdoClassic.TabIndex = 1
        Me.rdoClassic.TabStop = True
        Me.rdoClassic.Text = "Classic (€54.49)"
        Me.rdoClassic.UseVisualStyleBackColor = True
        '
        'rdoRetro
        '
        Me.rdoRetro.AutoSize = True
        Me.rdoRetro.Location = New System.Drawing.Point(20, 64)
        Me.rdoRetro.Name = "rdoRetro"
        Me.rdoRetro.Size = New System.Drawing.Size(155, 29)
        Me.rdoRetro.TabIndex = 2
        Me.rdoRetro.TabStop = True
        Me.rdoRetro.Text = "Retro (€49.50"
        Me.rdoRetro.UseVisualStyleBackColor = True
        '
        'rdoVintage
        '
        Me.rdoVintage.AutoSize = True
        Me.rdoVintage.Location = New System.Drawing.Point(20, 94)
        Me.rdoVintage.Name = "rdoVintage"
        Me.rdoVintage.Size = New System.Drawing.Size(183, 29)
        Me.rdoVintage.TabIndex = 3
        Me.rdoVintage.TabStop = True
        Me.rdoVintage.Text = "Vintage (€44.99)"
        Me.rdoVintage.UseVisualStyleBackColor = True
        '
        'GroupBox1
        '
        Me.GroupBox1.Controls.Add(Me.btnNext)
        Me.GroupBox1.Controls.Add(Me.rdoClassic)
        Me.GroupBox1.Controls.Add(Me.rdoVintage)
        Me.GroupBox1.Controls.Add(Me.rdoRetro)
        Me.GroupBox1.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.GroupBox1.Location = New System.Drawing.Point(228, 12)
        Me.GroupBox1.Name = "GroupBox1"
        Me.GroupBox1.Size = New System.Drawing.Size(258, 173)
        Me.GroupBox1.TabIndex = 4
        Me.GroupBox1.TabStop = False
        Me.GroupBox1.Text = "Shoe Type:"
        '
        'btnNext
        '
        Me.btnNext.Location = New System.Drawing.Point(147, 128)
        Me.btnNext.Name = "btnNext"
        Me.btnNext.Size = New System.Drawing.Size(79, 39)
        Me.btnNext.TabIndex = 7
        Me.btnNext.Text = "Next"
        Me.btnNext.UseVisualStyleBackColor = True
        '
        'lblShoe
        '
        Me.lblShoe.AutoSize = True
        Me.lblShoe.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblShoe.Location = New System.Drawing.Point(24, 12)
        Me.lblShoe.Name = "lblShoe"
        Me.lblShoe.Size = New System.Drawing.Size(192, 25)
        Me.lblShoe.TabIndex = 5
        Me.lblShoe.Text = "Select Shoe Type:"
        '
        'grpCustimisation
        '
        Me.grpCustimisation.Controls.Add(Me.lblIfcolourwhite)
        Me.grpCustimisation.Controls.Add(Me.txtText)
        Me.grpCustimisation.Controls.Add(Me.chkText)
        Me.grpCustimisation.Controls.Add(Me.picHeart)
        Me.grpCustimisation.Controls.Add(Me.picFootball)
        Me.grpCustimisation.Controls.Add(Me.picStar)
        Me.grpCustimisation.Controls.Add(Me.picFlower)
        Me.grpCustimisation.Controls.Add(Me.picFlame)
        Me.grpCustimisation.Controls.Add(Me.cmbLogo)
        Me.grpCustimisation.Controls.Add(Me.chkLogo)
        Me.grpCustimisation.Controls.Add(Me.cmbLaces)
        Me.grpCustimisation.Controls.Add(Me.cmbEyestay)
        Me.grpCustimisation.Controls.Add(Me.cmbHeeltab)
        Me.grpCustimisation.Controls.Add(Me.cmbHeelback)
        Me.grpCustimisation.Controls.Add(Me.cmbColourvamp)
        Me.grpCustimisation.Controls.Add(Me.chkLaces)
        Me.grpCustimisation.Controls.Add(Me.chkHeelback)
        Me.grpCustimisation.Controls.Add(Me.chkHeeltab)
        Me.grpCustimisation.Controls.Add(Me.chkEyestay)
        Me.grpCustimisation.Controls.Add(Me.chkVamp)
        Me.grpCustimisation.Controls.Add(Me.btnProceed)
        Me.grpCustimisation.Controls.Add(Me.cmbColour1)
        Me.grpCustimisation.Controls.Add(Me.chkQuarter)
        Me.grpCustimisation.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.grpCustimisation.Location = New System.Drawing.Point(29, 204)
        Me.grpCustimisation.Name = "grpCustimisation"
        Me.grpCustimisation.Size = New System.Drawing.Size(810, 334)
        Me.grpCustimisation.TabIndex = 6
        Me.grpCustimisation.TabStop = False
        Me.grpCustimisation.Text = "Choose Custimisation:"
        Me.grpCustimisation.Visible = False
        '
        'lblIfcolourwhite
        '
        Me.lblIfcolourwhite.AutoSize = True
        Me.lblIfcolourwhite.Font = New System.Drawing.Font("Microsoft Sans Serif", 8.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblIfcolourwhite.Location = New System.Drawing.Point(20, 31)
        Me.lblIfcolourwhite.Name = "lblIfcolourwhite"
        Me.lblIfcolourwhite.Size = New System.Drawing.Size(352, 20)
        Me.lblIfcolourwhite.TabIndex = 24
        Me.lblIfcolourwhite.Text = "(If colour white is chosen you will not be charged)"
        '
        'txtText
        '
        Me.txtText.Location = New System.Drawing.Point(674, 153)
        Me.txtText.Name = "txtText"
        Me.txtText.Size = New System.Drawing.Size(121, 30)
        Me.txtText.TabIndex = 23
        '
        'chkText
        '
        Me.chkText.AutoSize = True
        Me.chkText.Location = New System.Drawing.Point(379, 153)
        Me.chkText.Name = "chkText"
        Me.chkText.Size = New System.Drawing.Size(245, 29)
        Me.chkText.TabIndex = 22
        Me.chkText.Text = "Text (up to 10 = €0.45)*"
        Me.chkText.UseVisualStyleBackColor = True
        '
        'picHeart
        '
        Me.picHeart.Image = CType(resources.GetObject("picHeart.Image"), System.Drawing.Image)
        Me.picHeart.Location = New System.Drawing.Point(408, 258)
        Me.picHeart.Name = "picHeart"
        Me.picHeart.Size = New System.Drawing.Size(129, 60)
        Me.picHeart.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom
        Me.picHeart.TabIndex = 21
        Me.picHeart.TabStop = False
        Me.picHeart.Visible = False
        '
        'picFootball
        '
        Me.picFootball.Image = CType(resources.GetObject("picFootball.Image"), System.Drawing.Image)
        Me.picFootball.Location = New System.Drawing.Point(408, 258)
        Me.picFootball.Name = "picFootball"
        Me.picFootball.Size = New System.Drawing.Size(129, 60)
        Me.picFootball.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom
        Me.picFootball.TabIndex = 19
        Me.picFootball.TabStop = False
        Me.picFootball.Visible = False
        '
        'picStar
        '
        Me.picStar.Image = CType(resources.GetObject("picStar.Image"), System.Drawing.Image)
        Me.picStar.Location = New System.Drawing.Point(408, 258)
        Me.picStar.Name = "picStar"
        Me.picStar.Size = New System.Drawing.Size(129, 60)
        Me.picStar.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom
        Me.picStar.TabIndex = 18
        Me.picStar.TabStop = False
        Me.picStar.Visible = False
        '
        'picFlower
        '
        Me.picFlower.Image = CType(resources.GetObject("picFlower.Image"), System.Drawing.Image)
        Me.picFlower.Location = New System.Drawing.Point(408, 258)
        Me.picFlower.Name = "picFlower"
        Me.picFlower.Size = New System.Drawing.Size(129, 60)
        Me.picFlower.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom
        Me.picFlower.TabIndex = 17
        Me.picFlower.TabStop = False
        Me.picFlower.Visible = False
        '
        'picFlame
        '
        Me.picFlame.Image = CType(resources.GetObject("picFlame.Image"), System.Drawing.Image)
        Me.picFlame.Location = New System.Drawing.Point(408, 258)
        Me.picFlame.Name = "picFlame"
        Me.picFlame.Size = New System.Drawing.Size(129, 60)
        Me.picFlame.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom
        Me.picFlame.TabIndex = 16
        Me.picFlame.TabStop = False
        Me.picFlame.Visible = False
        '
        'cmbLogo
        '
        Me.cmbLogo.FormattingEnabled = True
        Me.cmbLogo.Items.AddRange(New Object() {"Flame", "Flower", "Football", "Heart", "Star"})
        Me.cmbLogo.Location = New System.Drawing.Point(674, 203)
        Me.cmbLogo.Name = "cmbLogo"
        Me.cmbLogo.Size = New System.Drawing.Size(121, 33)
        Me.cmbLogo.TabIndex = 15
        '
        'chkLogo
        '
        Me.chkLogo.AutoSize = True
        Me.chkLogo.Location = New System.Drawing.Point(379, 207)
        Me.chkLogo.Name = "chkLogo"
        Me.chkLogo.Size = New System.Drawing.Size(226, 29)
        Me.chkLogo.TabIndex = 14
        Me.chkLogo.Text = "Logo (18% of *Costs)"
        Me.chkLogo.UseVisualStyleBackColor = True
        '
        'cmbLaces
        '
        Me.cmbLaces.FormattingEnabled = True
        Me.cmbLaces.Items.AddRange(New Object() {"Blue", "Green", "Orange", "Red", "Yellow", "Black", "White"})
        Me.cmbLaces.Location = New System.Drawing.Point(674, 102)
        Me.cmbLaces.Name = "cmbLaces"
        Me.cmbLaces.Size = New System.Drawing.Size(121, 33)
        Me.cmbLaces.TabIndex = 13
        '
        'cmbEyestay
        '
        Me.cmbEyestay.FormattingEnabled = True
        Me.cmbEyestay.Items.AddRange(New Object() {"Blue", "Green", "Orange", "Red", "Yellow", "Black", "White"})
        Me.cmbEyestay.Location = New System.Drawing.Point(219, 153)
        Me.cmbEyestay.Name = "cmbEyestay"
        Me.cmbEyestay.Size = New System.Drawing.Size(121, 33)
        Me.cmbEyestay.TabIndex = 12
        '
        'cmbHeeltab
        '
        Me.cmbHeeltab.FormattingEnabled = True
        Me.cmbHeeltab.Items.AddRange(New Object() {"Blue", "Green", "Orange", "Red", "Yellow", "Black", "White"})
        Me.cmbHeeltab.Location = New System.Drawing.Point(219, 207)
        Me.cmbHeeltab.Name = "cmbHeeltab"
        Me.cmbHeeltab.Size = New System.Drawing.Size(121, 33)
        Me.cmbHeeltab.TabIndex = 11
        '
        'cmbHeelback
        '
        Me.cmbHeelback.FormattingEnabled = True
        Me.cmbHeelback.Items.AddRange(New Object() {"Blue", "Green", "Orange", "Red", "Yellow", "Black", "White"})
        Me.cmbHeelback.Location = New System.Drawing.Point(674, 53)
        Me.cmbHeelback.Name = "cmbHeelback"
        Me.cmbHeelback.Size = New System.Drawing.Size(121, 33)
        Me.cmbHeelback.TabIndex = 10
        '
        'cmbColourvamp
        '
        Me.cmbColourvamp.FormattingEnabled = True
        Me.cmbColourvamp.Items.AddRange(New Object() {"Blue", "Green", "Orange", "Red", "Yellow", "Black", "White"})
        Me.cmbColourvamp.Location = New System.Drawing.Point(219, 102)
        Me.cmbColourvamp.Name = "cmbColourvamp"
        Me.cmbColourvamp.Size = New System.Drawing.Size(121, 33)
        Me.cmbColourvamp.TabIndex = 9
        '
        'chkLaces
        '
        Me.chkLaces.AutoSize = True
        Me.chkLaces.Location = New System.Drawing.Point(379, 104)
        Me.chkLaces.Name = "chkLaces"
        Me.chkLaces.Size = New System.Drawing.Size(132, 29)
        Me.chkLaces.TabIndex = 8
        Me.chkLaces.Text = "Laces (€4)"
        Me.chkLaces.UseVisualStyleBackColor = True
        '
        'chkHeelback
        '
        Me.chkHeelback.AutoSize = True
        Me.chkHeelback.Location = New System.Drawing.Point(379, 57)
        Me.chkHeelback.Name = "chkHeelback"
        Me.chkHeelback.Size = New System.Drawing.Size(279, 29)
        Me.chkHeelback.TabIndex = 7
        Me.chkHeelback.Text = "Heel/Back Counter (€6.49)*" & Global.Microsoft.VisualBasic.ChrW(13) & Global.Microsoft.VisualBasic.ChrW(10)
        Me.chkHeelback.UseVisualStyleBackColor = True
        '
        'chkHeeltab
        '
        Me.chkHeeltab.AutoSize = True
        Me.chkHeeltab.Location = New System.Drawing.Point(20, 207)
        Me.chkHeeltab.Name = "chkHeeltab"
        Me.chkHeeltab.Size = New System.Drawing.Size(194, 29)
        Me.chkHeeltab.TabIndex = 6
        Me.chkHeeltab.Text = "Heel Tab (€4.99)*"
        Me.chkHeeltab.UseVisualStyleBackColor = True
        '
        'chkEyestay
        '
        Me.chkEyestay.AutoSize = True
        Me.chkEyestay.Location = New System.Drawing.Point(20, 153)
        Me.chkEyestay.Name = "chkEyestay"
        Me.chkEyestay.Size = New System.Drawing.Size(157, 29)
        Me.chkEyestay.TabIndex = 5
        Me.chkEyestay.Text = "Eyestay (€5)*"
        Me.chkEyestay.UseVisualStyleBackColor = True
        '
        'chkVamp
        '
        Me.chkVamp.AutoSize = True
        Me.chkVamp.Location = New System.Drawing.Point(20, 106)
        Me.chkVamp.Name = "chkVamp"
        Me.chkVamp.Size = New System.Drawing.Size(177, 29)
        Me.chkVamp.TabIndex = 4
        Me.chkVamp.Text = "Vamp (€14.99)*"
        Me.chkVamp.UseVisualStyleBackColor = True
        '
        'btnProceed
        '
        Me.btnProceed.Location = New System.Drawing.Point(656, 267)
        Me.btnProceed.Name = "btnProceed"
        Me.btnProceed.Size = New System.Drawing.Size(129, 40)
        Me.btnProceed.TabIndex = 3
        Me.btnProceed.Text = "Proceed"
        Me.btnProceed.UseVisualStyleBackColor = True
        '
        'cmbColour1
        '
        Me.cmbColour1.FormattingEnabled = True
        Me.cmbColour1.Items.AddRange(New Object() {"Blue", "Green", "Orange", "Red", "Yellow", "Black", "White"})
        Me.cmbColour1.Location = New System.Drawing.Point(219, 55)
        Me.cmbColour1.Name = "cmbColour1"
        Me.cmbColour1.Size = New System.Drawing.Size(121, 33)
        Me.cmbColour1.TabIndex = 1
        '
        'chkQuarter
        '
        Me.chkQuarter.AutoSize = True
        Me.chkQuarter.Location = New System.Drawing.Point(20, 57)
        Me.chkQuarter.Name = "chkQuarter"
        Me.chkQuarter.Size = New System.Drawing.Size(175, 29)
        Me.chkQuarter.TabIndex = 0
        Me.chkQuarter.Text = "Quarter(€8.99)*"
        Me.chkQuarter.UseVisualStyleBackColor = True
        '
        'txtSum
        '
        Me.txtSum.Location = New System.Drawing.Point(349, 561)
        Me.txtSum.Name = "txtSum"
        Me.txtSum.ReadOnly = True
        Me.txtSum.Size = New System.Drawing.Size(100, 26)
        Me.txtSum.TabIndex = 7
        Me.txtSum.Visible = False
        '
        'btnDisplay
        '
        Me.btnDisplay.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btnDisplay.Location = New System.Drawing.Point(483, 552)
        Me.btnDisplay.Name = "btnDisplay"
        Me.btnDisplay.Size = New System.Drawing.Size(129, 40)
        Me.btnDisplay.TabIndex = 8
        Me.btnDisplay.Text = "Display"
        Me.btnDisplay.UseVisualStyleBackColor = True
        Me.btnDisplay.Visible = False
        '
        'lblPrice
        '
        Me.lblPrice.AutoSize = True
        Me.lblPrice.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblPrice.Location = New System.Drawing.Point(75, 562)
        Me.lblPrice.Name = "lblPrice"
        Me.lblPrice.Size = New System.Drawing.Size(243, 25)
        Me.lblPrice.TabIndex = 9
        Me.lblPrice.Text = "Price of Shoe Before VAT:"
        Me.lblPrice.Visible = False
        '
        'picClassic
        '
        Me.picClassic.Image = CType(resources.GetObject("picClassic.Image"), System.Drawing.Image)
        Me.picClassic.Location = New System.Drawing.Point(492, 12)
        Me.picClassic.Name = "picClassic"
        Me.picClassic.Size = New System.Drawing.Size(292, 173)
        Me.picClassic.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage
        Me.picClassic.TabIndex = 10
        Me.picClassic.TabStop = False
        Me.picClassic.Visible = False
        '
        'picRetro
        '
        Me.picRetro.Image = CType(resources.GetObject("picRetro.Image"), System.Drawing.Image)
        Me.picRetro.Location = New System.Drawing.Point(492, 12)
        Me.picRetro.Name = "picRetro"
        Me.picRetro.Size = New System.Drawing.Size(292, 173)
        Me.picRetro.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage
        Me.picRetro.TabIndex = 26
        Me.picRetro.TabStop = False
        Me.picRetro.Visible = False
        '
        'picVintage
        '
        Me.picVintage.Image = CType(resources.GetObject("picVintage.Image"), System.Drawing.Image)
        Me.picVintage.Location = New System.Drawing.Point(492, 12)
        Me.picVintage.Name = "picVintage"
        Me.picVintage.Size = New System.Drawing.Size(292, 173)
        Me.picVintage.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom
        Me.picVintage.TabIndex = 26
        Me.picVintage.TabStop = False
        Me.picVintage.Visible = False
        '
        'lblPricevat
        '
        Me.lblPricevat.AutoSize = True
        Me.lblPricevat.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.lblPricevat.Location = New System.Drawing.Point(75, 612)
        Me.lblPricevat.Name = "lblPricevat"
        Me.lblPricevat.Size = New System.Drawing.Size(220, 25)
        Me.lblPricevat.TabIndex = 27
        Me.lblPricevat.Text = "Price of shoe after VAT:"
        Me.lblPricevat.Visible = False
        '
        'txtPricevat
        '
        Me.txtPricevat.Location = New System.Drawing.Point(349, 611)
        Me.txtPricevat.Name = "txtPricevat"
        Me.txtPricevat.ReadOnly = True
        Me.txtPricevat.Size = New System.Drawing.Size(100, 26)
        Me.txtPricevat.TabIndex = 28
        Me.txtPricevat.Visible = False
        '
        'btnDisplayprice
        '
        Me.btnDisplayprice.Font = New System.Drawing.Font("Microsoft Sans Serif", 10.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btnDisplayprice.Location = New System.Drawing.Point(483, 604)
        Me.btnDisplayprice.Name = "btnDisplayprice"
        Me.btnDisplayprice.Size = New System.Drawing.Size(129, 40)
        Me.btnDisplayprice.TabIndex = 29
        Me.btnDisplayprice.Text = "Display Price"
        Me.btnDisplayprice.UseVisualStyleBackColor = True
        Me.btnDisplayprice.Visible = False
        '
        'frmYourstyle
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(9.0!, 20.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(861, 668)
        Me.Controls.Add(Me.btnDisplayprice)
        Me.Controls.Add(Me.txtPricevat)
        Me.Controls.Add(Me.lblPricevat)
        Me.Controls.Add(Me.picVintage)
        Me.Controls.Add(Me.picRetro)
        Me.Controls.Add(Me.picClassic)
        Me.Controls.Add(Me.lblPrice)
        Me.Controls.Add(Me.btnDisplay)
        Me.Controls.Add(Me.txtSum)
        Me.Controls.Add(Me.grpCustimisation)
        Me.Controls.Add(Me.lblShoe)
        Me.Controls.Add(Me.GroupBox1)
        Me.Name = "frmYourstyle"
        Me.Text = "Yourstyle"
        Me.GroupBox1.ResumeLayout(False)
        Me.GroupBox1.PerformLayout()
        Me.grpCustimisation.ResumeLayout(False)
        Me.grpCustimisation.PerformLayout()
        CType(Me.picHeart, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picFootball, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picStar, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picFlower, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picFlame, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picClassic, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picRetro, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.picVintage, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub

    Friend WithEvents rdoClassic As RadioButton
    Friend WithEvents rdoRetro As RadioButton
    Friend WithEvents rdoVintage As RadioButton
    Friend WithEvents GroupBox1 As GroupBox
    Friend WithEvents btnNext As Button
    Friend WithEvents lblShoe As Label
    Friend WithEvents grpCustimisation As GroupBox
    Friend WithEvents cmbColour1 As ComboBox
    Friend WithEvents chkQuarter As CheckBox
    Friend WithEvents btnProceed As Button
    Friend WithEvents txtSum As TextBox
    Friend WithEvents btnDisplay As Button
    Friend WithEvents lblPrice As Label
    Friend WithEvents chkLaces As CheckBox
    Friend WithEvents chkHeelback As CheckBox
    Friend WithEvents chkHeeltab As CheckBox
    Friend WithEvents chkEyestay As CheckBox
    Friend WithEvents chkVamp As CheckBox
    Friend WithEvents cmbLaces As ComboBox
    Friend WithEvents cmbEyestay As ComboBox
    Friend WithEvents cmbHeeltab As ComboBox
    Friend WithEvents cmbHeelback As ComboBox
    Friend WithEvents cmbColourvamp As ComboBox
    Friend WithEvents chkLogo As CheckBox
    Friend WithEvents picHeart As PictureBox
    Friend WithEvents picFootball As PictureBox
    Friend WithEvents picStar As PictureBox
    Friend WithEvents picFlower As PictureBox
    Friend WithEvents picFlame As PictureBox
    Friend WithEvents cmbLogo As ComboBox
    Friend WithEvents chkText As CheckBox
    Friend WithEvents txtText As TextBox
    Friend WithEvents picClassic As PictureBox
    Friend WithEvents picRetro As PictureBox
    Friend WithEvents picVintage As PictureBox
    Friend WithEvents lblPricevat As Label
    Friend WithEvents txtPricevat As TextBox
    Friend WithEvents btnDisplayprice As Button
    Friend WithEvents lblIfcolourwhite As Label
End Class
