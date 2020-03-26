Public Class frmYourstyle

    Private Sub btnNext_Click(sender As Object, e As EventArgs) Handles btnNext.Click
        If rdoClassic.Checked = True Then
            dblModel += 54.49.ToString("C")
        ElseIf rdoRetro.Checked = True Then
            dblModel += 49.5.ToString("C")
        ElseIf rdoVintage.Checked = True Then
            dblModel += 44.99.ToString("C")
        End If

        If rdoClassic.Checked = True Then
            picClassic.Visible = True
            picRetro.Visible = False
            picVintage.Visible = False

        ElseIf rdoRetro.Checked = True Then
            picVintage.Visible = False
            picClassic.Visible = False
            picRetro.Visible = True
        ElseIf rdoVintage.Checked = True Then
            picVintage.Visible = True
            picClassic.Visible = False
            picRetro.Visible = False

        End If
        grpCustimisation.Visible = True
    End Sub

    Private Sub btnProceed_Click(sender As Object, e As EventArgs) Handles btnProceed.Click
        If chkQuarter.Checked = True And
            cmbColour1.Text = "Black" Then
            dblQuarter += 8.99.ToString("C")
        ElseIf chkQuarter.Checked = True And
        cmbColour1.Text = "Blue" Then
            dblQuarter += 8.99.ToString("C")
        ElseIf chkQuarter.Checked = True And
        cmbColour1.Text = "Green" Then
            dblQuarter += 8.99.ToString("C")
        ElseIf chkQuarter.Checked = True And
        cmbColour1.Text = "Orange" Then
            dblQuarter += 8.99.ToString("C")
        ElseIf chkQuarter.Checked = True And
        cmbColour1.Text = "Red" Then
            dblQuarter += 8.99.ToString("C")
        ElseIf chkQuarter.Checked = True And
        cmbColour1.Text = "Yellow" Then
            dblQuarter += 8.99.ToString("C")
        ElseIf chkQuarter.Checked = True And
            cmbColour1.Text = "White" Then
            dblQuarter += 0.ToString("C")
        ElseIf chkQuarter.Checked = False Then
            dblQuarter += 0.ToString("C")
        End If

        If chkVamp.Checked = True And
            cmbColourvamp.Text = "Black" Then
            dblVamp += 14.99.ToString("C")
        ElseIf chkVamp.Checked = True And
        cmbColourvamp.Text = "Blue" Then
            dblVamp += 14.99.ToString("C")
        ElseIf chkVamp.Checked = True And
        cmbColourvamp.Text = "Green" Then
            dblVamp += 14.99.ToString("C")
        ElseIf chkVamp.Checked = True And
        cmbColourvamp.Text = "Orange" Then
            dblVamp += 14.99.ToString("C")
        ElseIf chkVamp.Checked = True And
        cmbColourvamp.Text = "Red" Then
            dblVamp += 14.99.ToString("C")
        ElseIf chkVamp.Checked = True And
        cmbColourvamp.Text = "Yellow" Then
            dblVamp += 14.99.ToString("C")
        ElseIf chkVamp.Checked = True And
            cmbColourvamp.Text = "White" Then
            dblVamp += 0.ToString("C")
        ElseIf chkVamp.Checked = False Then
            dblVamp += 0.ToString("C")
        End If

        If chkEyestay.Checked = True And
            cmbEyestay.Text = "Black" Then
            dblEyestay += 5.ToString("C")
        ElseIf chkEyestay.Checked = True And
        cmbEyestay.Text = "Blue" Then
            dblEyestay += 5.ToString("C")
        ElseIf chkEyestay.Checked = True And
        cmbEyestay.Text = "Green" Then
            dblEyestay += 5.ToString("C")
        ElseIf chkEyestay.Checked = True And
        cmbEyestay.Text = "Orange" Then
            dblEyestay += 5.ToString("C")
        ElseIf chkEyestay.Checked = True And
        cmbEyestay.Text = "Red" Then
            dblEyestay += 5.ToString("C")
        ElseIf chkEyestay.Checked = True And
        cmbEyestay.Text = "Yellow" Then
            dblEyestay += 5.ToString("C")
        ElseIf chkEyestay.Checked = True And
            cmbEyestay.Text = "White" Then
            dblEyestay += 0.ToString("C")
        ElseIf chkEyestay.Checked = False Then
            dblEyestay += 0.ToString("C")
        End If

        If chkHeeltab.Checked = True And
            cmbHeeltab.Text = "Black" Then
            dblHeeltab += 4.99.ToString("C")
        ElseIf chkHeeltab.Checked = True And
        cmbHeeltab.Text = "Blue" Then
            dblHeeltab += 4.99.ToString("C")
        ElseIf chkHeeltab.Checked = True And
        cmbHeeltab.Text = "Green" Then
            dblHeeltab += 4.99.ToString("C")
        ElseIf chkHeeltab.Checked = True And
        cmbHeeltab.Text = "Orange" Then
            dblHeeltab += 4.99.ToString("C")
        ElseIf chkHeeltab.Checked = True And
        cmbHeeltab.Text = "Red" Then
            dblHeeltab += 4.99.ToString("C")
        ElseIf chkHeeltab.Checked = True And
        cmbHeeltab.Text = "Yellow" Then
            dblHeeltab += 4.99.ToString("C")
        ElseIf chkHeeltab.Checked = True And
        cmbHeeltab.Text = "White" Then
            dblHeeltab += 0.ToString("C")
        ElseIf chkHeeltab.Checked = False Then
            dblHeeltab += 0.ToString("C")
        End If

        If chkHeelback.Checked = True And
            cmbHeelback.Text = "Black" Then
            dblHeelback += 6.49.ToString("C")
        ElseIf chkHeelback.Checked = True And
        cmbHeelback.Text = "Blue" Then
            dblHeelback += 6.49.ToString("C")
        ElseIf chkHeelback.Checked = True And
        cmbHeelback.Text = "Green" Then
            dblHeelback += 6.49.ToString("C")
        ElseIf chkHeelback.Checked = True And
        cmbHeelback.Text = "Orange" Then
            dblHeelback += 6.49.ToString("C")
        ElseIf chkHeelback.Checked = True And
        cmbHeelback.Text = "Red" Then
            dblHeelback += 6.49.ToString("C")
        ElseIf chkHeelback.Checked = True And
        cmbHeelback.Text = "Yellow" Then
            dblHeelback += 6.49.ToString("C")
        ElseIf chkHeelback.Checked = True And
        cmbHeelback.Text = "White" Then
            dblHeelback += 0.ToString("C")
        ElseIf chkHeelback.Checked = False Then
            dblHeelback += 0.ToString("C")
        End If

        If chkLaces.Checked = True And
            cmbLaces.Text = "Black" Then
            dblLace += 4.ToString("C")
        ElseIf chkLaces.Checked = True And
        cmbLaces.Text = "Blue" Then
            dblLace += 4.ToString("C")
        ElseIf chkLaces.Checked = True And
        cmbLaces.Text = "Green" Then
            dblLace += 4.ToString("C")
        ElseIf chkLaces.Checked = True And
        cmbLaces.Text = "Orange" Then
            dblLace += 4.ToString("C")
        ElseIf chkLaces.Checked = True And
        cmbLaces.Text = "Red" Then
            dblLace += 4.ToString("C")
        ElseIf chkLaces.Checked = True And
        cmbLaces.Text = "Yellow" Then
            dblLace += 4.ToString("C")
        ElseIf chkLaces.Checked = True And
        cmbLaces.Text = "White" Then
            dblLace += 0.ToString("C")
        ElseIf chkLaces.Checked = False Then
            dblLace += 0.ToString("C")
        End If

        If chkText.Checked = True And
            txtText.Text.Length <= 10 Then
            dblText += 0.45
        ElseIf txtText.Text.Length > 10 Then
            dblText += 0.5
        ElseIf chkText.Checked = False Then
            dblText += 0.ToString("C")
        End If

        If chkLogo.Checked = True Then
            dblLogo += ((dblQuarter + dblHeeltab + dblText + dblVamp + dblEyestay + dblHeelback) * 0.18).ToString("C")
        ElseIf chkLogo.Checked = False Then
            dblLogo += 0.ToString("C")
        End If



        lblPrice.Visible = True
        txtSum.Visible = True
        btnDisplay.Visible = True

    End Sub

    Private Sub btnDisplay_Click(sender As Object, e As EventArgs) Handles btnDisplay.Click
        txtSum.Text = CDbl(dblModel + dblQuarter + dblVamp + dblEyestay + dblHeeltab + dblHeelback + dblText + dblLogo + dblLace)

        lblPricevat.Visible = True
        txtPricevat.Visible = True
        btnDisplayprice.Visible = True
    End Sub

    Private Sub cmbLogo_SelectedIndexChanged(sender As Object, e As EventArgs) Handles cmbLogo.SelectedIndexChanged
        If chkLogo.Checked = True And
             cmbLogo.Text = "Star" Then
            picStar.Visible = True
            picFlame.Visible = False
            picFootball.Visible = False
            picFlower.Visible = False
            picHeart.Visible = False

        ElseIf chkLogo.Checked = True And
              cmbLogo.Text = "Flame" Then
            picFlame.Visible = True
            picStar.Visible = False
            picFootball.Visible = False
            picFlower.Visible = False
            picHeart.Visible = False

        ElseIf chkLogo.Checked = True And
              cmbLogo.Text = "Flower" Then
            picFlower.Visible = True
            picFlame.Visible = False
            picStar.Visible = False
            picFootball.Visible = False
            picHeart.Visible = False

        ElseIf chkLogo.Checked = True And
                   cmbLogo.Text = "Football" Then
            picFootball.Visible = True
            picFlame.Visible = False
            picStar.Visible = False
            picFlower.Visible = False
            picHeart.Visible = False

        ElseIf chkLogo.Checked = True And
              cmbLogo.Text = "Heart" Then
            picFlame.Visible = False
            picStar.Visible = False
            picFootball.Visible = False
            picFlower.Visible = False
            picHeart.Visible = True
        End If
    End Sub

    Private Sub btnDisplayprice_Click(sender As Object, e As EventArgs) Handles btnDisplayprice.Click
        dblTotalprice = (txtSum.Text) * 1.23
        txtPricevat.Text = CDbl(dblTotalprice)
    End Sub
End Class