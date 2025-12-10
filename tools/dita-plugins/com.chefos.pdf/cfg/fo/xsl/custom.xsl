<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    xmlns:fox="http://xmlgraphics.apache.org/fop/extensions"
    version="2.0">

    <xsl:param name="customizationDir.url" />

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
                        width="301mm" height="214mm">
                        <fo:block line-height="0" font-size="0pt" margin="0pt" padding="0pt">
                            <fo:external-graphic
                                src="{$cover-image}"
                                content-width="301mm"
                                content-height="214mm"
                                scaling="non-uniform" />
                        </fo:block>
                    </fo:block-container>

                    <fo:block-container xsl:use-attribute-sets="__frontmatter">
                        <xsl:call-template name="createFrontCoverContents" />
                    </fo:block-container>
                </fo:flow>
            </fo:page-sequence>
        </xsl:if>
    </xsl:template>

    <!-- Override region-body attributes to add watermark -->
    <xsl:attribute-set name="region-body.odd">
        <xsl:attribute name="background-image">url('<xsl:value-of select="$customizationDir.url" />
            common/artwork/watermark.svg')</xsl:attribute>
        <xsl:attribute name="background-position-horizontal">center</xsl:attribute>
        <xsl:attribute name="background-position-vertical">center</xsl:attribute>
        <xsl:attribute name="background-repeat">no-repeat</xsl:attribute>
    </xsl:attribute-set>

    <xsl:attribute-set name="region-body.even">
        <xsl:attribute name="background-image">url('<xsl:value-of select="$customizationDir.url" />
            common/artwork/watermark.svg')</xsl:attribute>
        <xsl:attribute name="background-position-horizontal">center</xsl:attribute>
        <xsl:attribute name="background-position-vertical">center</xsl:attribute>
        <xsl:attribute name="background-repeat">no-repeat</xsl:attribute>
    </xsl:attribute-set>

</xsl:stylesheet>