<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    version="2.0">

    <!-- Page setup -->
    <xsl:attribute-set name="__force__page__count">
        <xsl:attribute name="force-page-count">auto</xsl:attribute>
    </xsl:attribute-set>

    <!-- Font settings -->
    <xsl:variable name="base-font-family">Serif</xsl:variable>
    <xsl:variable name="title-font-family">Sans</xsl:variable>

    <!-- Titles -->
    <xsl:attribute-set name="topic.title">
        <xsl:attribute name="font-family"><xsl:value-of select="$title-font-family" /></xsl:attribute>
        <xsl:attribute name="font-weight">bold</xsl:attribute>
        <xsl:attribute name="color">#2c3e50</xsl:attribute>
        <xsl:attribute name="border-bottom">2pt solid #e67e22</xsl:attribute>
        <xsl:attribute name="padding-bottom">4pt</xsl:attribute>
        <xsl:attribute name="margin-bottom">12pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Task Body -->
    <xsl:attribute-set name="taskbody">
        <xsl:attribute name="margin-top">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Prereq (Ingredients) -->
    <xsl:attribute-set name="prereq">
        <xsl:attribute name="background-color">#fdf2e9</xsl:attribute>
        <xsl:attribute name="padding">10pt</xsl:attribute>
        <xsl:attribute name="border-left">4pt solid #e67e22</xsl:attribute>
        <xsl:attribute name="margin-bottom">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Context (Preparation) -->
    <xsl:attribute-set name="context">
        <xsl:attribute name="background-color">#f4f6f7</xsl:attribute>
        <xsl:attribute name="padding">10pt</xsl:attribute>
        <xsl:attribute name="border-left">4pt solid #3498db</xsl:attribute>
        <xsl:attribute name="margin-bottom">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Steps -->
    <xsl:attribute-set name="steps">
        <xsl:attribute name="margin-top">10pt</xsl:attribute>
    </xsl:attribute-set>

    <xsl:attribute-set name="step">
        <xsl:attribute name="margin-bottom">8pt</xsl:attribute>
    </xsl:attribute-set>

    <xsl:attribute-set name="cmd">
        <xsl:attribute name="font-weight">bold</xsl:attribute>
    </xsl:attribute-set>

</xsl:stylesheet>