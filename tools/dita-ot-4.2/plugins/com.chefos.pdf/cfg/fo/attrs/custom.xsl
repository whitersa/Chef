<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    version="2.0">

    <!-- Page setup -->
    <xsl:attribute-set name="__force__page__count">
        <xsl:attribute name="force-page-count">auto</xsl:attribute>
    </xsl:attribute-set>

    <!-- Font settings -->
    <xsl:variable name="base-font-family">Sans</xsl:variable>
    <xsl:variable name="title-font-family">Sans</xsl:variable>

    <!-- Page Size -->
    <xsl:variable name="page-width">297mm</xsl:variable>
    <xsl:variable name="page-height">210mm</xsl:variable>

    <!-- Cover Image -->
    <!-- Cover Image -->
    <!-- Cover Image -->
    <xsl:variable name="cover-image">
        file:/C:/Users/lilong.bai/Documents/develop/chef/tools/dita-plugins/com.chefos.pdf/cfg/common/artwork/cover.jpg</xsl:variable>

    <!-- Watermark -->
    <xsl:variable name="watermark-text">DRAFT</xsl:variable>

    <!-- Color Theme Variables -->
    <xsl:variable name="theme-color-title">#2c3e50</xsl:variable>
    <xsl:variable name="theme-color-accent">#f41a02</xsl:variable>
    <xsl:variable name="theme-color-secondary">#0226f4</xsl:variable>

    <!-- Hide Cover Title -->
    <xsl:attribute-set name="__frontmatter__title">
        <xsl:attribute name="color">transparent</xsl:attribute>
        <xsl:attribute name="font-size">0pt</xsl:attribute>
    </xsl:attribute-set>

    <xsl:attribute-set name="__frontmatter__subtitle">
        <xsl:attribute name="color">transparent</xsl:attribute>
        <xsl:attribute name="font-size">0pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Allow Watermark to overflow header -->
    <xsl:attribute-set name="region-before">
        <xsl:attribute name="overflow">visible</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="region-after">
        <xsl:attribute name="overflow">visible</xsl:attribute>
    </xsl:attribute-set>

    <!-- Titles -->
    <xsl:attribute-set name="topic.title">
        <xsl:attribute name="font-family"><xsl:value-of select="$title-font-family" /></xsl:attribute>
        <xsl:attribute name="font-weight">bold</xsl:attribute>
        <xsl:attribute name="color"><xsl:value-of select="$theme-color-title" /></xsl:attribute>
        <xsl:attribute name="border-bottom">2pt solid <xsl:value-of select="$theme-color-accent" /></xsl:attribute>
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
        <xsl:attribute name="border-left">4pt solid <xsl:value-of select="$theme-color-accent" /></xsl:attribute>
        <xsl:attribute name="margin-bottom">10pt</xsl:attribute>
    </xsl:attribute-set>

    <!-- Context (Preparation) -->
    <xsl:attribute-set name="context">
        <xsl:attribute name="background-color">#f4f6f7</xsl:attribute>
        <xsl:attribute name="padding">10pt</xsl:attribute>
        <xsl:attribute name="border-left">4pt solid <xsl:value-of select="$theme-color-secondary" /></xsl:attribute>
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