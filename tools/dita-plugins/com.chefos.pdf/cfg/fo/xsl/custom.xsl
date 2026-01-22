<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    xmlns:fox="http://xmlgraphics.apache.org/fop/extensions"
    xmlns:opentopic="http://www.idiominc.com/opentopic"
    xmlns:opentopic-index="http://www.idiominc.com/opentopic/index"
    xmlns:ot-placeholder="http://suite-sol.com/namespaces/ot-placeholder"
    xmlns:dita-ot="http://dita-ot.sourceforge.net/ns/201007/dita-ot"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0">

    <xsl:param name="customizationDir.url" />
    <xsl:variable name="map" select="//opentopic:map" />

    <!-- Watermark Template -->
    <xsl:template name="insertWatermark">
        <fo:block-container absolute-position="fixed" top="0" left="0" width="100%" height="100%"
            z-index="1000">
            <fo:block-container width="100%" height="100%" display-align="center">
                <fo:block text-align="center">
                    <fo:instream-foreign-object content-width="150mm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"
                            viewBox="0 0 500 500">
                            <text x="50%" y="50%" transform="rotate(-45 250 250)"
                                text-anchor="middle"
                                dominant-baseline="middle"
                                font-family="Serif" font-weight="bold" font-size="100"
                                fill="#CCCCCC" fill-opacity="0.3">
                                DRAFT
                            </text>
                        </svg>
                    </fo:instream-foreign-object>
                </fo:block>
            </fo:block-container>
        </fo:block-container>
    </xsl:template>

    <xsl:template name="createFrontMatter">
        <xsl:if test="$generate-front-cover">
            <fo:page-sequence master-reference="front-matter" format="1"
                xsl:use-attribute-sets="page-sequence.cover">
                <xsl:call-template name="insertFrontMatterStaticContents" />
                <fo:flow flow-name="xsl-region-body">
                    <!-- Background Image -->
                    <!-- Bleed Fix: Slightly oversized container to ensure full coverage (A4
                    Landscape) -->
                    <fo:block-container absolute-position="fixed"
                        top="-2mm" left="-2mm"
                        width="301mm" height="214mm" z-index="1">
                        <fo:block line-height="0" font-size="0pt" margin="0pt" padding="0pt">
                            <fo:external-graphic
                                src="{$cover-image}"
                                content-width="301mm"
                                content-height="214mm"
                                scaling="non-uniform" />
                        </fo:block>
                    </fo:block-container>

                    <!-- Watermark on Cover -->
                    <xsl:call-template name="insertWatermark" />

                    <fo:block-container xsl:use-attribute-sets="__frontmatter" z-index="10">
                        <xsl:call-template name="createFrontCoverContents" />
                    </fo:block-container>
                </fo:flow>
            </fo:page-sequence>
        </xsl:if>
    </xsl:template>

    <!-- Header Overrides (Removed Watermark to avoid occlusion) -->
    <!-- We are moving Watermark to Footers to ensure it renders on top of body content -->

    <!-- Footer Overrides to include Watermark -->
    <xsl:template name="insertBodyOddFooter">
        <fo:static-content flow-name="odd-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body Odd Footer'" />
                <xsl:with-param name="theParameters">
                    <prodname>
                        <xsl:value-of select="$productName" />
                    </prodname>
                    <heading>
                        <fo:inline xsl:use-attribute-sets="__body__odd__footer__heading">
                            <fo:retrieve-marker retrieve-class-name="current-header" />
                        </fo:inline>
                    </heading>
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__odd__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertBodyEvenFooter">
        <fo:static-content flow-name="even-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body Even Footer'" />
                <xsl:with-param name="theParameters">
                    <prodname>
                        <xsl:value-of select="$productName" />
                    </prodname>
                    <heading>
                        <fo:inline xsl:use-attribute-sets="__body__even__footer__heading">
                            <fo:retrieve-marker retrieve-class-name="current-header" />
                        </fo:inline>
                    </heading>
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__even__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertBodyFirstFooter">
        <fo:static-content flow-name="first-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body First Footer'" />
                <xsl:with-param name="theParameters">
                    <prodname>
                        <xsl:value-of select="$productName" />
                    </prodname>
                    <heading>
                        <fo:inline xsl:use-attribute-sets="__body__first__footer__heading">
                            <fo:retrieve-marker retrieve-class-name="current-header" />
                        </fo:inline>
                    </heading>
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__first__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertBodyLastFooter">
        <fo:static-content flow-name="last-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body Even Footer'" />
                <xsl:with-param name="theParameters">
                    <prodname>
                        <xsl:value-of select="$productName" />
                    </prodname>
                    <heading>
                        <fo:inline xsl:use-attribute-sets="__body__even__footer__heading">
                            <fo:retrieve-marker retrieve-class-name="current-header" />
                        </fo:inline>
                    </heading>
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__even__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <!-- TOC Header Overrides (Removed as they didn't work) -->

    <!-- Override createToc to inject Watermark -->
    <xsl:template name="createToc">
        <xsl:if test="$generate-toc">
            <xsl:variable name="toc">
                <xsl:choose>
                    <xsl:when test="$map//*[contains(@class,' bookmap/toc ')][@href]" />
                    <xsl:when test="$map//*[contains(@class,' bookmap/toc ')]">
                        <xsl:apply-templates select="/" mode="toc" />
                    </xsl:when>
                    <xsl:when
                        test="/*[contains(@class,' map/map ')][not(contains(@class,' bookmap/bookmap '))]">
                        <xsl:apply-templates select="/" mode="toc" />
                        <xsl:call-template
                            name="toc.index" />
                    </xsl:when>
                </xsl:choose>
            </xsl:variable>
            <xsl:if
                test="count($toc/*) > 0">
                <fo:page-sequence master-reference="toc-sequence"
                    xsl:use-attribute-sets="page-sequence.toc">
                    <xsl:call-template name="insertTocStaticContents" />
                    <fo:flow flow-name="xsl-region-body">
                        <!-- Watermark removed from flow to avoid column duplication. It is handled
                        in footer. -->

                        <xsl:call-template name="createTocHeader" />
                        <fo:block>
                            <fo:marker marker-class-name="current-header">
                                <xsl:call-template name="getVariable">
                                    <xsl:with-param name="id" select="'Table of Contents'" />
                                </xsl:call-template>
                            </fo:marker>
                            <xsl:apply-templates select="." mode="customTopicMarker" />
                            <xsl:copy-of select="$toc" />
                        </fo:block>
                    </fo:flow>
                </fo:page-sequence>
            </xsl:if>
        </xsl:if>
    </xsl:template>

    <!-- Override insertTocStaticContents to ensure footers are always generated -->
    <xsl:template name="insertTocStaticContents">
        <xsl:call-template name="insertTocOddFooter" />
        <xsl:call-template name="insertTocEvenFooter" />
        <xsl:call-template
            name="insertTocOddHeader" />
        <xsl:if test="$mirror-page-margins">
            <xsl:call-template name="insertTocEvenHeader" />
        </xsl:if>
    </xsl:template>

    <!-- TOC Footer Overrides -->
    <xsl:template name="insertTocOddFooter">
        <fo:static-content flow-name="odd-toc-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Toc Odd Footer'" />
                <xsl:with-param name="theParameters">
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__toc__odd__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertTocEvenFooter">
        <fo:static-content flow-name="even-toc-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Toc Even Footer'" />
                <xsl:with-param name="theParameters">
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__toc__even__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <!-- Preface Footer Overrides -->
    <xsl:template name="insertPrefaceOddFooter">
        <fo:static-content flow-name="odd-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body Odd Footer'" />
                <xsl:with-param name="theParameters">
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__odd__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertPrefaceEvenFooter">
        <fo:static-content flow-name="even-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body Even Footer'" />
                <xsl:with-param name="theParameters">
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__even__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertPrefaceFirstFooter">
        <fo:static-content flow-name="first-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body First Footer'" />
                <xsl:with-param name="theParameters">
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__first__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <xsl:template name="insertPrefaceLastFooter">
        <fo:static-content flow-name="last-body-footer">
            <xsl:call-template name="insertWatermark" />
            <xsl:call-template name="insertVariable">
                <xsl:with-param name="theVariableID" select="'Body Even Footer'" />
                <xsl:with-param name="theParameters">
                    <pagenum>
                        <fo:inline xsl:use-attribute-sets="__body__even__footer__pagenum">
                            <fo:page-number />
                        </fo:inline>
                    </pagenum>
                </xsl:with-param>
            </xsl:call-template>
        </fo:static-content>
    </xsl:template>

    <!-- Override Page Masters for Column Layouts -->
    <xsl:template match="/" mode="create-page-masters">
        <!-- Frontmatter simple masters -->
        <fo:simple-page-master
            master-name="front-matter-first" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body__frontmatter.odd" />
        </fo:simple-page-master>

        <fo:simple-page-master
            master-name="front-matter-last" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body__frontmatter.even" />
            <fo:region-before region-name="last-frontmatter-header"
                xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="last-frontmatter-footer"
                xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <xsl:if
            test="$mirror-page-margins">
            <fo:simple-page-master master-name="front-matter-even"
                xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body__frontmatter.even" />
                <fo:region-before region-name="even-frontmatter-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="even-frontmatter-footer"
                    xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>
        </xsl:if>

        <fo:simple-page-master
            master-name="front-matter-odd" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body__frontmatter.odd" />
            <fo:region-before region-name="odd-frontmatter-header"
                xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-frontmatter-footer"
                xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <!-- Backcover simple masters -->
        <xsl:if
            test="$generate-back-cover">
            <xsl:if test="$mirror-page-margins">
                <fo:simple-page-master master-name="back-cover-even"
                    xsl:use-attribute-sets="simple-page-master">
                    <fo:region-body xsl:use-attribute-sets="region-body__backcover.even" />
                    <fo:region-before region-name="even-back-cover-header"
                        xsl:use-attribute-sets="region-before" />
                    <fo:region-after region-name="even-back-cover-footer"
                        xsl:use-attribute-sets="region-after" />
                </fo:simple-page-master>
            </xsl:if>

            <fo:simple-page-master
                master-name="back-cover-odd" xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body__backcover.odd" />
                <fo:region-before region-name="odd-back-cover-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="odd-back-cover-footer"
                    xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>

            <fo:simple-page-master
                master-name="back-cover-last" xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body__backcover.even" />
                <fo:region-before region-name="last-back-cover-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="last-back-cover-footer"
                    xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>
        </xsl:if>

        <!-- TOC simple masters (3 Columns) -->
        <xsl:if
            test="$mirror-page-margins">
            <fo:simple-page-master master-name="toc-even"
                xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body.even" column-count="3"
                    column-gap="12pt" />
                <fo:region-before region-name="even-toc-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="even-toc-footer" xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>
        </xsl:if>

        <fo:simple-page-master
            master-name="toc-odd" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.odd" column-count="3"
                column-gap="12pt" />
            <fo:region-before region-name="odd-toc-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-toc-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <fo:simple-page-master
            master-name="toc-last" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.even" column-count="3"
                column-gap="12pt" />
            <fo:region-before region-name="even-toc-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="even-toc-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <fo:simple-page-master
            master-name="toc-first" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.odd" column-count="3"
                column-gap="12pt" />
            <fo:region-before region-name="odd-toc-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-toc-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <!-- BODY simple masters (2 Columns) -->
        <fo:simple-page-master
            master-name="body-first" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.odd" column-count="2"
                column-gap="12pt" />
            <fo:region-before region-name="first-body-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="first-body-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <xsl:if
            test="$mirror-page-margins">
            <fo:simple-page-master master-name="body-even"
                xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body.even" column-count="2"
                    column-gap="12pt" />
                <fo:region-before region-name="even-body-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="even-body-footer"
                    xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>
        </xsl:if>

        <fo:simple-page-master
            master-name="body-odd" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.odd" column-count="2"
                column-gap="12pt" />
            <fo:region-before region-name="odd-body-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-body-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <fo:simple-page-master
            master-name="body-last" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.even" column-count="2"
                column-gap="12pt" />
            <fo:region-before region-name="last-body-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="last-body-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <!-- INDEX simple masters -->
        <fo:simple-page-master
            master-name="index-first" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body__index.odd" />
            <fo:region-before region-name="odd-index-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-index-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <xsl:if
            test="$mirror-page-margins">
            <fo:simple-page-master master-name="index-even"
                xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body__index.even" />
                <fo:region-before region-name="even-index-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="even-index-footer"
                    xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>
        </xsl:if>

        <fo:simple-page-master
            master-name="index-odd" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body__index.odd" />
            <fo:region-before region-name="odd-index-header" xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-index-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <!-- GLOSSARY simple masters -->
        <fo:simple-page-master
            master-name="glossary-first" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.odd" />
            <fo:region-before region-name="odd-glossary-header"
                xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-glossary-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>

        <xsl:if
            test="$mirror-page-margins">
            <fo:simple-page-master master-name="glossary-even"
                xsl:use-attribute-sets="simple-page-master">
                <fo:region-body xsl:use-attribute-sets="region-body.even" />
                <fo:region-before region-name="even-glossary-header"
                    xsl:use-attribute-sets="region-before" />
                <fo:region-after region-name="even-glossary-footer"
                    xsl:use-attribute-sets="region-after" />
            </fo:simple-page-master>
        </xsl:if>

        <fo:simple-page-master
            master-name="glossary-odd" xsl:use-attribute-sets="simple-page-master">
            <fo:region-body xsl:use-attribute-sets="region-body.odd" />
            <fo:region-before region-name="odd-glossary-header"
                xsl:use-attribute-sets="region-before" />
            <fo:region-after region-name="odd-glossary-footer" xsl:use-attribute-sets="region-after" />
        </fo:simple-page-master>
    </xsl:template>

    <!-- Override TOC Entry for Chapters -->
    <xsl:template match="*[contains(@class, ' topic/topic ')]" mode="toc">
        <xsl:param name="include" />
        <xsl:variable name="topicLevel" as="xs:integer">
            <xsl:apply-templates select="." mode="get-topic-level" />
        </xsl:variable>
        <xsl:if
            test="$topicLevel &lt; $tocMaximumLevel">
            <xsl:variable name="mapTopicref" select="key('map-id', @id)[1]" as="element()?" />
            <xsl:choose>
                <xsl:when
                    test="$retain-bookmap-order and $mapTopicref/self::*[contains(@class, ' bookmap/notices ')]" />
                <xsl:when
                    test="$mapTopicref[@toc = 'yes' or not(@toc)] or
                              (not($mapTopicref) and $include = 'true')">

                    <xsl:choose>
                        <!-- Custom Chapter Display -->
                        <xsl:when test="$mapTopicref[contains(@class, ' bookmap/chapter ')]">
                            <fo:block xsl:use-attribute-sets="__toc__chapter__content"
                                margin-top="20pt" margin-bottom="20pt" keep-with-next="always">
                                <fo:basic-link xsl:use-attribute-sets="__toc__link">
                                    <xsl:attribute name="internal-destination">
                                        <xsl:call-template name="generate-toc-id" />
                                    </xsl:attribute>

                                    <fo:block font-size="36pt" font-weight="bold" color="#333333"
                                        text-align="left">
                                        <xsl:text>0</xsl:text>
                                        <xsl:apply-templates select="$mapTopicref"
                                            mode="topicTitleNumber" />
                                    </fo:block>
                                </fo:basic-link>
                            </fo:block>
                        </xsl:when>

                        <!-- Default Display -->
                        <xsl:otherwise>
                            <fo:block xsl:use-attribute-sets="__toc__indent">
                                <xsl:variable name="tocItemContent">
                                    <fo:basic-link xsl:use-attribute-sets="__toc__link">
                                        <xsl:attribute name="internal-destination">
                                            <xsl:call-template name="generate-toc-id" />
                                        </xsl:attribute>
                                        <xsl:attribute name="fox:alt-text">
                                            <xsl:call-template name="getNavTitle" />
                                        </xsl:attribute>
                                        <xsl:apply-templates
                                            select="*[contains(@class,' ditaot-d/ditaval-startprop ')]/revprop[@changebar]"
                                            mode="changebar">
                                            <xsl:with-param name="changebar-id"
                                                select="concat(dita-ot:generate-changebar-id(.),'-toc')" />
                                        </xsl:apply-templates>
                                        <xsl:apply-templates select="$mapTopicref" mode="tocPrefix" />
                                        <fo:inline xsl:use-attribute-sets="__toc__title">
                                            <xsl:variable name="pulledNavigationTitle" as="item()*">
                                                <xsl:call-template name="getNavTitle" />
                                            </xsl:variable>
                                            <xsl:apply-templates select="$pulledNavigationTitle"
                                                mode="dropCopiedIds" />
                                        </fo:inline>
                                        <xsl:apply-templates
                                            select="*[contains(@class,' ditaot-d/ditaval-endprop ')]/revprop[@changebar]"
                                            mode="changebar">
                                            <xsl:with-param name="changebar-id"
                                                select="concat(dita-ot:generate-changebar-id(.),'-toc')" />
                                        </xsl:apply-templates>
                                        <fo:inline xsl:use-attribute-sets="__toc__page-number">
                                            <fo:leader xsl:use-attribute-sets="__toc__leader" />
                                            <fo:page-number-citation>
                                                <xsl:attribute name="ref-id">
                                                    <xsl:call-template name="generate-toc-id" />
                                                </xsl:attribute>
                                            </fo:page-number-citation>
                                        </fo:inline>
                                    </fo:basic-link>
                                </xsl:variable>
                                <xsl:choose>
                                    <xsl:when test="not($mapTopicref)">
                                        <xsl:apply-templates select="." mode="tocText">
                                            <xsl:with-param name="tocItemContent"
                                                select="$tocItemContent" />
                                            <xsl:with-param name="currentNode" select="." />
                                        </xsl:apply-templates>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:apply-templates select="$mapTopicref" mode="tocText">
                                            <xsl:with-param name="tocItemContent"
                                                select="$tocItemContent" />
                                            <xsl:with-param name="currentNode" select="." />
                                        </xsl:apply-templates>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </fo:block>
                        </xsl:otherwise>
                    </xsl:choose>
                    
                    <xsl:apply-templates
                        mode="#current">
                        <xsl:with-param name="include" select="'true'" />
                    </xsl:apply-templates>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates mode="#current">
                        <xsl:with-param name="include" select="'true'" />
                    </xsl:apply-templates>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>